import csv
import io
import logging
from datetime import datetime
from decimal import Decimal
from django.db.models import F
from my_app.models import AuditLog, IngestionJob, RawSAPRecord, EmissionRecord, EmissionFactor
from my_app.utils.unit_conversions import normalize_sap_unit

# 1. Global Mappings
SAP_UNIT_MAP = {
    'L': ('litre', Decimal('1.0')),
    'KG': ('kg', Decimal('1.0')),
    'M3': ('m3', Decimal('1.0')),
    'TO': ('kg', Decimal('1000.0')),
    'GAL': ('litre', Decimal('3.78541')),
    'FT3': ('m3', Decimal('0.0283168')),
    'KWH': ('kwh', Decimal('1.0')),
    'MWH': ('kwh', Decimal('1000.0')),
    'GJ': ('kwh', Decimal('277.778')),
}

MATERIAL_FUEL_MAP = {
    'FUEL-DSL': 'diesel',
    'FUEL-PET': 'petrol',
    'FUEL-NG': 'natural_gas',
    'FUEL-LPG': 'lpg',
    'FUEL-HFO': 'heavy_fuel_oil',
    'PROC-': 'general_fuel', 
}

PLANT_COUNTRY_MAP = {
    'DE': 'DE', 'IN': 'IN', 'US': 'US', 'UK': 'GB',
    'FR': 'FR', 'SG': 'SG', 'AU': 'AU',
}

class SAPParser:
    """Parser for SAP IDoc-style flat-file CSV ingestion."""
    
    def parse(self, file_obj, job: IngestionJob) -> tuple[int, int, list]:
        AuditLog.objects.create(
            client=job.client, actor=job.initiated_by,
            action='INGESTION_STARTED', target_model='IngestionJob', target_id=str(job.id)
        )
        
        content = file_obj.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8')
        
        first_line = content.split('\n')[0]
        delimiter = '|' if '|' in first_line else ('\t' if '\t' in first_line else ',')
            
        reader = csv.DictReader(io.StringIO(content), delimiter=delimiter)
        
        success_count = 0
        fail_count = 0
        errors = []
        
        for line_no, row in enumerate(reader, start=2):
            try:
                # --- STEP 1: CLEAN THE DATA ---
                
                # Clean Date
                raw_date_str = row.get('BLDAT', '').strip().replace('"', '').replace('“', '').replace('”', '')
                parsed_date = None
                for fmt in ['%d.%m.%Y', '%Y%m%d', '%m/%d/%Y', '%Y-%m-%d']:
                    try:
                        parsed_date = datetime.strptime(raw_date_str, fmt).date()
                        break
                    except ValueError:
                        continue
                if not parsed_date:
                    raise ValueError(f"Invalid date format: {row.get('BLDAT')}")

                # Clean MENGE (Numbers)
                raw_menge_str = row.get('MENGE', '0').strip()
                if not raw_menge_str:
                    menge_val = Decimal('0')
                else:
                    m_str = raw_menge_str.replace('.', '').replace(',', '.')
                    menge_val = Decimal(m_str)
                    
                # Clean WRBTR (Numbers)
                raw_wrbtr_str = row.get('WRBTR', '0').strip()
                if not raw_wrbtr_str:
                    wrbtr_val = Decimal('0')
                else:
                    w_str = raw_wrbtr_str.replace('.', '').replace(',', '.')
                    wrbtr_val = Decimal(w_str)


                # --- STEP 2: SAVE STAGING RECORD ---
                raw_rec = RawSAPRecord.objects.create(
                    job=job,
                    WERKS=row.get('WERKS', ''),
                    MATNR=row.get('MATNR', ''),
                    MENGE=menge_val,       
                    MEINS=row.get('MEINS', ''),
                    WRBTR=wrbtr_val,       
                    WAERS=row.get('WAERS', ''),
                    BLDAT=parsed_date,     
                    BKTXT=row.get('BKTXT', ''),
                    KOSTL=row.get('KOSTL', ''),
                    LIFNR=row.get('LIFNR', ''),
                    raw_line_number=line_no,
                    raw_data=str(row)
                )
                
                # --- STEP 3: MAP AND CALCULATE ---
                sap_unit = row.get('MEINS', '').strip().upper()
                si_unit, multiplier = SAP_UNIT_MAP.get(sap_unit, ('unknown', Decimal('1.0')))
                normalized_value, si_unit = normalize_sap_unit(
                    menge_val * multiplier,
                    row.get("MEINS", "L")
                )

                activity_value = Decimal(
                    str(normalized_value)
                )
                
                fuel_type = 'unknown_fuel' 
                for prefix, f_type in MATERIAL_FUEL_MAP.items():
                    if row.get('MATNR', '').startswith(prefix):
                        fuel_type = f_type
                        break

                country_code = PLANT_COUNTRY_MAP.get(row.get('WERKS', '')[:2], 'UNKNOWN')
                
                ef_record = EmissionFactor.objects.filter(fuel_type=fuel_type).first()
                emission_factor = ef_record.factor_value if ef_record else Decimal('2.68')
                ef_source = ef_record.source_name if ef_record else 'ESTIMATED'
                ef_unit = ef_record.factor_unit if ef_record else 'tCO2e/unit'
                
                co2e = activity_value * emission_factor
                anomaly = co2e > Decimal('50.0')
                
                # --- STEP 4: SAVE FINAL RECORD ---
                factor = EmissionFactor.objects.filter(
                    fuel_type__iexact=fuel_type
                ).first()

                if not factor:
                    raise ValueError(
                        f"No emission factor found for fuel type: {fuel_type}"
                    )

                co2e = Decimal(activity_value) * Decimal(factor.factor_value)

                EmissionRecord.objects.create(
                        client=job.client,
                        source_type='SAP',
                        ingestion_job=job,

                        source_row_id=raw_rec.id,
                        source_row_model='RawSAPRecord',

                        scope=factor.ghg_protocol_category,
                        category='STATIONARY_COMBUSTION',

                        activity_value=activity_value,
                        activity_unit=si_unit,

                        activity_description=(
                            f"{fuel_type} procurement - "
                            f"{row.get('BKTXT', '')}"
                        ),

                        activity_date=parsed_date,
                        period_start=parsed_date,
                        period_end=parsed_date,

                        emission_factor=factor.factor_value,

                        emission_factor_source=str(factor.source_name),

                        emission_factor_unit=str(factor.factor_unit),

                        co2e_tonnes=co2e,

                        calculation_method=(
                            f"{activity_value} {si_unit} × "
                            f"{factor.factor_value} "
                            f"{factor.factor_unit}"
                        ),

                        site_code=row.get('WERKS', ''),
                        country_code=country_code,

                        review_status='PENDING',

                        is_flagged_anomaly=anomaly,

                        anomaly_reason=(
                            "Unusually large single procurement"
                            if anomaly else ""
                        )
                )

                raw_rec.is_parsed = True
                raw_rec.save(update_fields=['is_parsed'])
                IngestionJob.objects.filter(id=job.id).update(row_count_success=F('row_count_success') + 1)
                success_count += 1
                
            except Exception as e:

                print(
                    f"DEBUG: Error at line "
                    f"{line_no}: {e}"
                )

                error_entry = {
                    "row": line_no,
                    "error": str(e)
                }

                errors.append(error_entry)

                job.error_log.append(error_entry)

                job.row_count_failed += 1

                job.save(
                    update_fields=[
                        "error_log",
                        "row_count_failed"
                    ]
                )

                fail_count += 1

                continue

        AuditLog.objects.create(client=job.client, actor=job.initiated_by, action='INGESTION_COMPLETED', target_model='IngestionJob', target_id=str(job.id))
        return success_count, fail_count, errors