import json
from decimal import Decimal
from datetime import datetime

from django.db.models import F

from my_app.models import (
    AuditLog,
    IngestionJob,
    RawTravelRecord,
    EmissionRecord
)

from my_app.utils.unit_conversions import (
    haversine_distance
)

AIRPORT_COORDS = {
    'LHR': (51.47, -0.45),
    'JFK': (40.64, -73.78),
    'DXB': (25.25, 55.36),
    'SIN': (1.36, 103.99),
    'BOM': (19.09, 72.86),
    'DEL': (28.55, 77.10),
    'SYD': (-33.94, 151.17),
    'CDG': (49.00, 2.55),
    'FRA': (50.03, 8.57),
    'AMS': (52.31, 4.76),
    'LAX': (33.94, -118.40),
    'ORD': (41.97, -87.90),
    'DFW': (32.89, -97.04),
    'HKG': (22.30, 113.91),
    'NRT': (35.77, 140.39),
    'ICN': (37.46, 126.44),
    'DOH': (25.27, 51.60),
    'AUH': (24.43, 54.65),
    'BLR': (13.19, 77.70),
    'MAA': (12.98, 80.16)
}


class TravelParser:
    """
    Parser for Corporate Travel
    (Navan/Concur-style)
    JSON APIs/extracts.
    """

    def parse(
        self,
        file_obj,
        job: IngestionJob
    ) -> tuple[int, int, list]:

        AuditLog.objects.create(
            client=job.client,
            actor=job.initiated_by,
            action='INGESTION_STARTED',
            target_model='IngestionJob',
            target_id=str(job.id)
        )

        if isinstance(file_obj, dict):
            data = file_obj

        else:
            content = file_obj.read()

            if isinstance(content, bytes):
                content = content.decode('utf-8')

            data = json.loads(content)

        expenses = (
            data.get('expenses', data)
            if isinstance(data, dict)
            else data
        )

        if not isinstance(expenses, list):
            raise ValueError(
                "Invalid JSON structure:"
                " Expected list of expenses."
            )

        success_count = 0
        fail_count = 0
        errors = []

        for i, item in enumerate(expenses):

            line_no = i + 1

            try:

                # -----------------------------
                # STEP 1: CLEAN DATA
                # -----------------------------

                expense_id = str(
                    item.get('expense_id') or ''
                )

                trip_type = str(
                    item.get('trip_type') or ''
                ).upper()

                origin = str(
                    item.get('origin') or ''
                )

                destination = str(
                    item.get('destination') or ''
                )

                cabin_class = str(
                    item.get('cabin_class') or ''
                ).upper()

                cost_currency = str(
                    item.get('cost_currency') or ''
                )

                dep_str = str(
                    item.get('departure_date')
                    or '2024-01-01'
                )

                departure_date = (
                    datetime
                    .fromisoformat(
                        dep_str.replace('Z', '')[:10]
                    )
                    .date()
                )

                ret_str = str(
                    item.get('return_date') or ''
                )

                return_date = (
                    datetime
                    .fromisoformat(
                        ret_str.replace('Z', '')[:10]
                    )
                    .date()
                    if ret_str
                    else departure_date
                )

                def clean_num(val):

                    if not val:
                        return None

                    clean_str = (
                        str(val)
                        .replace(',', '')
                        .replace('$', '')
                        .replace('€', '')
                        .replace('£', '')
                        .strip()
                    )

                    try:
                        return Decimal(clean_str)

                    except:
                        return None

                dist_val = clean_num(
                    item.get('distance_km')
                )

                cost_val = (
                    clean_num(
                        item.get('cost_amount')
                    )
                    or Decimal('0')
                )

                # -----------------------------
                # STEP 2: SAVE RAW RECORD
                # -----------------------------

                raw_rec = RawTravelRecord.objects.create(
                    job=job,

                    raw_line_number=line_no,

                    expense_id=expense_id,

                    trip_type=trip_type,

                    origin=origin,

                    destination=destination,

                    departure_date=departure_date,

                    return_date=return_date,

                    cabin_class=cabin_class,

                    distance_km=(
                        str(dist_val)
                        if dist_val is not None
                        else ''
                    ),

                    cost_amount=str(cost_val),

                    cost_currency=cost_currency,

                    raw_data=json.dumps(item)
                )

                # -----------------------------
                # STEP 3: MAP + NORMALIZE
                # -----------------------------

                category = ''

                activity_value = Decimal('0')

                activity_unit = 'km'

                emission_factor = Decimal('0')

                anomaly = False

                if trip_type == 'FLIGHT':

                    category = 'BUSINESS_TRAVEL_AIR'

                    if dist_val is not None:

                        activity_value = dist_val

                    else:

                        c1 = AIRPORT_COORDS.get(origin)

                        c2 = AIRPORT_COORDS.get(
                            destination
                        )

                        if c1 and c2:

                            distance = haversine_distance(
                                c1[0],
                                c1[1],
                                c2[0],
                                c2[1]
                            )

                            activity_value = Decimal(
                                str(distance)
                            )

                        else:

                            activity_value = Decimal(
                                '1000'
                            )

                    base_ef = Decimal('0.00009')

                    cabin_mult = (
                        Decimal('2.9')
                        if cabin_class == 'BUSINESS'
                        else Decimal('1.0')
                    )

                    emission_factor = (
                        base_ef
                        * cabin_mult
                        * Decimal('1.9')
                    )

                elif trip_type == 'HOTEL':

                    category = (
                        'BUSINESS_TRAVEL_HOTEL'
                    )

                    activity_unit = 'nights'

                    nights = (
                        return_date
                        - departure_date
                    ).days

                    activity_value = Decimal(
                        max(nights, 1)
                    )

                    emission_factor = Decimal(
                        '0.0000273'
                    )

                elif trip_type in [
                    'CAR_RENTAL',
                    'TAXI'
                ]:

                    category = (
                        'BUSINESS_TRAVEL_GROUND'
                    )

                    activity_value = (
                        dist_val
                        if dist_val is not None
                        else (
                            cost_val
                            / Decimal('0.30')
                        )
                    )

                    emission_factor = Decimal(
                        '0.000170'
                    )

                elif trip_type == 'RAIL':

                    category = (
                        'BUSINESS_TRAVEL_GROUND'
                    )

                    activity_value = (
                        dist_val
                        if dist_val is not None
                        else (
                            cost_val
                            / Decimal('0.20')
                        )
                    )

                    emission_factor = Decimal(
                        '0.000035'
                    )

                co2e = (
                    activity_value
                    * emission_factor
                )

                if co2e > Decimal('5.0'):
                    anomaly = True

                # -----------------------------
                # STEP 4: SAVE FINAL RECORD
                # -----------------------------

                EmissionRecord.objects.create(
                    client=job.client,

                    source_type='TRAVEL',

                    ingestion_job=job,

                    source_row_id=raw_rec.id,

                    source_row_model='RawTravelRecord',

                    scope='3',

                    category=(
                        category
                        or 'UNCATEGORIZED'
                    ),

                    activity_value=activity_value,

                    activity_unit=activity_unit,

                    activity_description=(
                        f"{trip_type} "
                        f"expense {expense_id}"
                    ),

                    activity_date=departure_date,

                    period_start=departure_date,

                    period_end=return_date,

                    emission_factor=emission_factor,

                    emission_factor_source='DEFRA_2024',

                    emission_factor_unit=(
                        f"tCO2e/{activity_unit}"
                    ),

                    co2e_tonnes=co2e,

                    calculation_method=(
                        'DISTANCE_BASED'
                        if activity_unit == 'km'
                        else 'ACTIVITY_BASED'
                    ),

                    site_code='UNKNOWN',

                    country_code='UNKNOWN',

                    review_status='PENDING',

                    is_flagged_anomaly=anomaly,

                    anomaly_reason=(
                        "Exceeds expected limits"
                        if anomaly
                        else ""
                    )
                )

                raw_rec.is_parsed = True

                raw_rec.save(
                    update_fields=['is_parsed']
                )

                IngestionJob.objects.filter(
                    id=job.id
                ).update(
                    row_count_success=(
                        F('row_count_success')
                        + 1
                    )
                )

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

        AuditLog.objects.create(
            client=job.client,
            actor=job.initiated_by,
            action='INGESTION_COMPLETED',
            target_model='IngestionJob',
            target_id=str(job.id)
        )

        return (
            success_count,
            fail_count,
            errors
        )