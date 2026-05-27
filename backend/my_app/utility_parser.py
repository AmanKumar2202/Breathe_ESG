import csv
from decimal import Decimal
from datetime import datetime
from django.utils import timezone

from my_app.models import (
    RawUtilityRecord,
    EmissionRecord,
    EmissionFactor,
    AuditLog
)

GRID_EMISSION_FACTORS = {
    'US': Decimal('0.000386'),
    'DE': Decimal('0.000338'),
    'GB': Decimal('0.000233'),
    'IN': Decimal('0.000708'),
}

UNIT_CONVERSIONS = {
    'KWH': Decimal('1'),
    'MWH': Decimal('1000'),
    'GJ': Decimal('277.778'),
    'THERMS': Decimal('29.3'),
}


class UtilityParser:

    def parse(self, file_obj, job):

        decoded_file = (
            file_obj
            .read()
            .decode('utf-8')
            .splitlines()
        )

        reader = csv.DictReader(decoded_file)

        for line_number, row in enumerate(reader, start=2):

            try:

                raw_rec = RawUtilityRecord.objects.create(
                    ingestion_job=job,
                    raw_data=row,
                    site_name=self._extract_site_name(row),
                    utility_type=self._extract_utility_type(row),
                    usage_value=self._extract_usage_value(row),
                    usage_unit=self._extract_usage_unit(row),
                    bill_date=self._extract_bill_date(row),
                )

                usage_value = Decimal(str(raw_rec.usage_value))

                original_unit = (
                    raw_rec.usage_unit
                    .strip()
                    .upper()
                )

                multiplier = UNIT_CONVERSIONS.get(
                    original_unit,
                    Decimal('1')
                )

                activity_value = (
                    usage_value * multiplier
                )

                activity_unit = 'kWh'

                site_prefix = (
                    raw_rec.site_name[:2]
                    .upper()
                )

                VALID_COUNTRIES = [
                    'US',
                    'DE',
                    'GB',
                    'IN'
                ]

                country_code = (
                    site_prefix
                    if site_prefix in VALID_COUNTRIES
                    else 'US'
                )

                grid_factor = GRID_EMISSION_FACTORS.get(
                    country_code,
                    Decimal('0.000386')
                )

                co2e = (
                    activity_value * grid_factor
                )

                start_date = self._extract_period_start(row)

                end_date = self._extract_period_end(row)

                midpoint_date = (
                    start_date +
                    (end_date - start_date) / 2
                )

                is_anomaly = (
                    activity_value > Decimal('1000000')
                )

                EmissionRecord.objects.create(
                    client=job.client,
                    source_type='UTILITY',
                    ingestion_job=job,
                    source_row_id=raw_rec.id,
                    source_row_model='RawUtilityRecord',

                    scope='2',

                    category='PURCHASED_ELECTRICITY',

                    activity_value=activity_value,

                    activity_unit=activity_unit,

                    activity_description=(
                        f"Electricity bill for "
                        f"{raw_rec.site_name}"
                    ),

                    activity_date=midpoint_date,

                    period_start=start_date,

                    period_end=end_date,

                    emission_factor=grid_factor,

                    emission_factor_source='EPA_2024_AVERAGE',

                    emission_factor_unit='tCO2e/kWh',

                    co2e_tonnes=co2e,

                    calculation_method='ACTIVITY_BASED',

                    site_code=raw_rec.site_name,

                    country_code=country_code,

                    review_status='PENDING',

                    is_flagged_anomaly=is_anomaly,

                    anomaly_reason=(
                        "Consumption outside expected ranges"
                        if is_anomaly
                        else ""
                    )
                )

                job.row_count_success += 1

            except Exception as e:

                print(
                    f"DEBUG: Error at line "
                    f"{line_number}: {str(e)}"
                )

                job.row_count_failed += 1

                job.error_log.append({
                    "row": line_number,
                    "error": str(e)
                })

            finally:

                job.save()

    def _extract_site_name(self, row):

        candidates = [
            'site_name',
            'site',
            'facility',
            'location',
            'plant'
        ]

        for field in candidates:

            if (
                field in row
                and row[field]
            ):
                return row[field]

        return 'Unknown Site'

    def _extract_utility_type(self, row):

        candidates = [
            'utility_type',
            'type',
            'energy_type'
        ]

        for field in candidates:

            if (
                field in row
                and row[field]
            ):
                return row[field]

        return 'Electricity'

    def _extract_usage_value(self, row):

        candidates = [
            'usage',
            'usage_value',
            'consumption',
            'amount',
            'kwh'
        ]

        for field in candidates:

            if (
                field in row
                and row[field]
            ):
                value = (
                    str(row[field])
                    .replace(',', '')
                    .strip()
                )

                return Decimal(value)

        raise ValueError(
            "No usage value found"
        )

    def _extract_usage_unit(self, row):

        candidates = [
            'unit',
            'usage_unit',
            'uom'
        ]

        for field in candidates:

            if (
                field in row
                and row[field]
            ):
                return row[field]

        return 'kWh'

    def _extract_bill_date(self, row):

        candidates = [
            'bill_date',
            'date',
            'invoice_date'
        ]

        for field in candidates:

            if (
                field in row
                and row[field]
            ):

                try:
                    return datetime.strptime(
                        row[field],
                        '%Y-%m-%d'
                    ).date()

                except Exception:
                    pass

        return timezone.now().date()

    def _extract_period_start(self, row):

        start_candidates = [
            'from',
            'start_date',
            'period_start',
            'period_from',
            'bill_from',
            'start',
            'date'
        ]

        for field in start_candidates:

            if (
                field in row
                and row[field]
            ):

                try:
                    return datetime.strptime(
                        row[field],
                        '%Y-%m-%d'
                    ).date()

                except Exception:
                    pass

        return datetime.strptime(
            '2024-01-01',
            '%Y-%m-%d'
        ).date()

    def _extract_period_end(self, row):

        end_candidates = [
            'to',
            'end_date',
            'period_end',
            'period_to',
            'bill_to',
            'end'
        ]

        for field in end_candidates:

            if (
                field in row
                and row[field]
            ):

                try:
                    return datetime.strptime(
                        row[field],
                        '%Y-%m-%d'
                    ).date()

                except Exception:
                    pass

        return datetime.strptime(
            '2024-01-31',
            '%Y-%m-%d'
        ).date()