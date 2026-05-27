import os
from decimal import Decimal
from datetime import date

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from my_app.models import (
    AuditLog,
    Client,
    EmissionFactor,
    EmissionRecord,
    IngestionJob,
    Profile,
)

from my_app.sap_parser import SAPParser
from my_app.travel_parser import TravelParser
from my_app.utility_parser import UtilityParser

class Command(BaseCommand):
    help = 'Seeds database with sample clients, users, emission factors, and ingestion data.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing demo data...")

        AuditLog.objects.all().delete()
        EmissionRecord.objects.all().delete()
        IngestionJob.objects.all().delete()
        EmissionFactor.objects.all().delete()

        Client.objects.all().delete()

        User.objects.exclude(is_superuser=True).delete()

        self.stdout.write(
            self.style.WARNING("Existing seed data cleared.")
        )

        # 1. Create Demo Client
        client = Client.objects.create(name="Acme Manufacturing", slug="acme")
        self.stdout.write(self.style.SUCCESS(f"Created Client: {client.name}"))

        # 2. Create Users
        roles = [('admin', 'admin'), ('analyst', 'analyst'), ('auditor', 'auditor')]
        admin_user = None
        for u_prefix, role in roles:
            user = User.objects.create_user(
                username=f"{u_prefix}@acme.com",
                email=f"{u_prefix}@acme.com",
                password=f"{u_prefix}123"
            )
            Profile.objects.create(user=user, client=client, role=role)
            self.stdout.write(f"Created user {user.username} with role {role}")
            if role == 'admin':
                admin_user = user

        # 3. Create Emission Factors
        factors = [

            {
                'name': 'Diesel combustion',
                'source_name': 'DEFRA_2024',
                'activity_type': 'STATIONARY_COMBUSTION',
                'fuel_type': 'diesel',
                'unit': 'litre',
                'factor_value': Decimal('0.00268'),
                'factor_unit': 'tCO2e/litre',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 1'
            },

            {
                'name': 'Petrol combustion',
                'source_name': 'DEFRA_2024',
                'activity_type': 'MOBILE_COMBUSTION',
                'fuel_type': 'petrol',
                'unit': 'litre',
                'factor_value': Decimal('0.00231'),
                'factor_unit': 'tCO2e/litre',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 1'
            },

            {
                'name': 'Natural gas',
                'source_name': 'DEFRA_2024',
                'activity_type': 'STATIONARY_COMBUSTION',
                'fuel_type': 'natural_gas',
                'unit': 'kwh',
                'factor_value': Decimal('0.00203'),
                'factor_unit': 'tCO2e/kWh',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 1'
            },

            {
                'name': 'LPG',
                'source_name': 'DEFRA_2024',
                'activity_type': 'STATIONARY_COMBUSTION',
                'fuel_type': 'lpg',
                'unit': 'litre',
                'factor_value': Decimal('0.00161'),
                'factor_unit': 'tCO2e/litre',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 1'
            },

            {
                'name': 'Heavy fuel oil',
                'source_name': 'DEFRA_2024',
                'activity_type': 'STATIONARY_COMBUSTION',
                'fuel_type': 'heavy_fuel_oil',
                'unit': 'litre',
                'factor_value': Decimal('0.00323'),
                'factor_unit': 'tCO2e/litre',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 1'
            },

            {
                'name': 'General procurement fuel',
                'source_name': 'EPA_2024_AVERAGE',
                'activity_type': 'STATIONARY_COMBUSTION',
                'fuel_type': 'general_fuel',
                'unit': 'kg',
                'factor_value': Decimal('0.002500'),
                'factor_unit': 'tCO2e/kg',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 1'
            },

            {
                'name': 'UK grid electricity',
                'source_name': 'DEFRA_2024',
                'activity_type': 'PURCHASED_ELECTRICITY',
                'fuel_type': '',
                'unit': 'kwh',
                'factor_value': Decimal('0.000193'),
                'factor_unit': 'tCO2e/kWh',
                'region': 'GB',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 2'
            },

            {
                'name': 'India grid electricity',
                'source_name': 'CEA_2023',
                'activity_type': 'PURCHASED_ELECTRICITY',
                'fuel_type': '',
                'unit': 'kwh',
                'factor_value': Decimal('0.000708'),
                'factor_unit': 'tCO2e/kWh',
                'region': 'IN',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 2'
            },

            {
                'name': 'US grid electricity',
                'source_name': 'EPA_2024',
                'activity_type': 'PURCHASED_ELECTRICITY',
                'fuel_type': '',
                'unit': 'kwh',
                'factor_value': Decimal('0.000386'),
                'factor_unit': 'tCO2e/kWh',
                'region': 'US',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 2'
            },

            {
                'name': 'Flight economy short',
                'source_name': 'DEFRA_2024',
                'activity_type': 'BUSINESS_TRAVEL_AIR',
                'fuel_type': '',
                'unit': 'km',
                'factor_value': Decimal('0.000255'),
                'factor_unit': 'tCO2e/pkm',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 3'
            },

            {
                'name': 'Flight economy long',
                'source_name': 'DEFRA_2024',
                'activity_type': 'BUSINESS_TRAVEL_AIR',
                'fuel_type': '',
                'unit': 'km',
                'factor_value': Decimal('0.000195'),
                'factor_unit': 'tCO2e/pkm',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 3'
            },

            {
                'name': 'Flight business long',
                'source_name': 'DEFRA_2024',
                'activity_type': 'BUSINESS_TRAVEL_AIR',
                'fuel_type': '',
                'unit': 'km',
                'factor_value': Decimal('0.000566'),
                'factor_unit': 'tCO2e/pkm',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 3'
            },

            {
                'name': 'Hotel stay',
                'source_name': 'DEFRA_2024',
                'activity_type': 'BUSINESS_TRAVEL_HOTEL',
                'fuel_type': '',
                'unit': 'nights',
                'factor_value': Decimal('0.0000273'),
                'factor_unit': 'tCO2e/night',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 3'
            },

            {
                'name': 'Car rental average',
                'source_name': 'DEFRA_2024',
                'activity_type': 'BUSINESS_TRAVEL_GROUND',
                'fuel_type': '',
                'unit': 'km',
                'factor_value': Decimal('0.000170'),
                'factor_unit': 'tCO2e/km',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 3'
            },

            {
                'name': 'UK rail',
                'source_name': 'DEFRA_2024',
                'activity_type': 'BUSINESS_TRAVEL_GROUND',
                'fuel_type': '',
                'unit': 'km',
                'factor_value': Decimal('0.000035'),
                'factor_unit': 'tCO2e/km',
                'valid_from': date(2024, 1, 1),
                'ghg_protocol_category': 'Scope 3'
            },
        ]
        for f in factors:
            EmissionFactor.objects.create(**f)
        self.stdout.write(self.style.SUCCESS(f"Created {len(factors)} Emission Factors."))

        # 4. Run Parsers on Fixtures
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        fixtures_dir = os.path.join(settings.BASE_DIR, 'fixtures')        
        sap_file = os.path.join(fixtures_dir, 'sap_sample.csv')
        if os.path.exists(sap_file):
            self.stdout.write("Running SAP Parser...")
            job = IngestionJob.objects.create(
                client=client, source_type='SAP', status='PROCESSING',
                file_name='sap_sample.csv', initiated_by=admin_user, raw_payload_ref=sap_file
            )
            with open(sap_file, 'r', encoding='utf-8') as f:
                SAPParser().parse(f, job)
            job.refresh_from_db()
            job.status = 'COMPLETED' if job.row_count_failed == 0 else 'PARTIAL'
            job.save()
            self.stdout.write(self.style.SUCCESS(f"SAP Job: {job.row_count_success} success, {job.row_count_failed} failed"))
        
        utility_file = os.path.join(fixtures_dir, 'utility_sample.csv')
        if os.path.exists(utility_file):
            self.stdout.write("Running Utility Parser...")
            job = IngestionJob.objects.create(
                client=client, source_type='UTILITY', status='PROCESSING',
                file_name='utility_sample.csv', initiated_by=admin_user, raw_payload_ref=utility_file
            )
            with open(utility_file, 'r', encoding='utf-8') as f:
                UtilityParser().parse(f, job)
            job.refresh_from_db()
            job.status = 'COMPLETED' if job.row_count_failed == 0 else 'PARTIAL'
            job.save()
            self.stdout.write(self.style.SUCCESS(f"Utility Job: {job.row_count_success} success, {job.row_count_failed} failed"))
            
        travel_file = os.path.join(fixtures_dir, 'travel_sample.json')
        if os.path.exists(travel_file):
            self.stdout.write("Running Travel Parser...")
            job = IngestionJob.objects.create(
                client=client, source_type='TRAVEL', status='PROCESSING',
                file_name='travel_sample.json', initiated_by=admin_user, raw_payload_ref=travel_file
            )
            with open(travel_file, 'r', encoding='utf-8') as f:
                TravelParser().parse(f, job)
            job.refresh_from_db()
            job.status = 'COMPLETED' if job.row_count_failed == 0 else 'PARTIAL'
            job.save()
            self.stdout.write(self.style.SUCCESS(f"Travel Job: {job.row_count_success} success, {job.row_count_failed} failed"))

        # 5. Approve/Flag subset of records
        records = list(EmissionRecord.objects.filter(client=client).order_by('id'))
        if len(records) >= 5:
            self.stdout.write("Applying manual review statuses to subset...")
            
            # Approve 3 records
            for r in records[0:3]:
                r.review_status = 'APPROVED'
                r.is_locked = True
                r.reviewed_by = admin_user
                r.review_notes = 'Looks good based on preliminary review.'
                r.save()
                
            # Flag 2 records
            for r in records[3:5]:
                r.review_status = 'FLAGGED'
                r.is_flagged_anomaly = True
                r.reviewed_by = admin_user
                r.anomaly_reason = 'Requires secondary confirmation of values.'
                r.save()
                
            self.stdout.write(self.style.SUCCESS("Marked 3 APPROVED and 2 FLAGGED records."))

        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))