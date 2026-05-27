import uuid
from django.db import models
from django.contrib.auth.models import User

# ==========================================
# 1. CORE MODELS
# (These must exist so the foreign keys have something to point to)
# ==========================================

class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Profile(models.Model):
    # This links the Profile to a User
    # 'related_name="profile"' is the magic keyword that makes 'request.user.profile' work
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    client = models.ForeignKey(
        'Client', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    role = models.CharField(max_length=50, default='analyst') 
    created_at = models.DateTimeField(auto_now_add=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"Profile for {self.user.username}"

class IngestionJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey('Client', on_delete=models.CASCADE, related_name='ingestion_jobs', null=True, blank=True)
    source_type = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    # ADD THESE FIELDS:
    file_name = models.CharField(max_length=255, null=True, blank=True)
    initiated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    raw_payload_ref = models.CharField(max_length=500, null=True, blank=True)

    raw_line_number = models.IntegerField(default=0)
    row_count_total = models.IntegerField(default=0)  # Add this if missing
    row_count_success = models.IntegerField(default=0) # Add this if missing
    row_count_failed = models.IntegerField(default=0)  # ADD THIS FIELD
    error_log = models.JSONField(
        default=list,
        blank=True
    )

    def __str__(self):
        return f"Job {self.id} - {self.status}"

class RawSAPRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    raw_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_parsed = models.BooleanField(default=False)
    job = models.ForeignKey('IngestionJob', on_delete=models.CASCADE)

    # Define the fields matching the parser's logic
    WERKS = models.CharField(max_length=50, null=True, blank=True)
    MATNR = models.CharField(max_length=50, null=True, blank=True)
    MENGE = models.FloatField(null=True, blank=True)
    MEINS = models.CharField(max_length=50, null=True, blank=True)
    WRBTR = models.FloatField(null=True, blank=True)
    WAERS = models.CharField(max_length=10, null=True, blank=True)
    BLDAT = models.DateField(null=True, blank=True)
    BKTXT = models.CharField(max_length=255, null=True, blank=True)
    KOSTL = models.CharField(max_length=50, null=True, blank=True)
    LIFNR = models.CharField(max_length=50, null=True, blank=True)
    raw_line_number = models.IntegerField()

class RawUtilityRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey('IngestionJob', on_delete=models.CASCADE)
    raw_line_number = models.IntegerField(default=0)
    
    meter_id = models.CharField(max_length=100, null=True, blank=True)
    site_name = models.CharField(max_length=100, null=True, blank=True)
    billing_period_start = models.DateField(null=True, blank=True)
    billing_period_end = models.DateField(null=True, blank=True)
    consumption_value = models.DecimalField(max_digits=20, decimal_places=6, null=True, blank=True)
    consumption_unit = models.CharField(max_length=50, null=True, blank=True)
    
    raw_data = models.TextField(null=True, blank=True)
    is_parsed = models.BooleanField(default=False)

class RawTravelRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey('IngestionJob', on_delete=models.CASCADE)
    raw_line_number = models.IntegerField(default=0)
    
    expense_id = models.CharField(max_length=100, null=True, blank=True)
    trip_type = models.CharField(max_length=50, null=True, blank=True)
    origin = models.CharField(max_length=50, null=True, blank=True)
    destination = models.CharField(max_length=50, null=True, blank=True)
    departure_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)
    cabin_class = models.CharField(max_length=50, null=True, blank=True)
    distance_km = models.CharField(max_length=50, null=True, blank=True)
    cost_amount = models.CharField(max_length=50, null=True, blank=True)
    cost_currency = models.CharField(max_length=10, null=True, blank=True)
    
    raw_data = models.TextField(null=True, blank=True)
    is_parsed = models.BooleanField(default=False)


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey('Client', on_delete=models.CASCADE,null=True, blank=True)
    
    # Added related_name to distinguish these two relationships
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_actions')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_user_logs')
    
    action = models.CharField(max_length=255)
    target_model = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100)
    model_name = models.CharField(max_length=50)
    record_id = models.CharField(max_length=255, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        # Changed to self.actor to match the primary field you are using
        return f"{self.action} by {self.actor} at {self.timestamp}"   
    
# ==========================================
# 2. EMISSION MODELS
# ==========================================

SCOPE_CHOICES = [
    ('1', 'Scope 1'),
    ('2', 'Scope 2'),
    ('3', 'Scope 3')
]

REVIEW_STATUS_CHOICES = [
    ('PENDING', 'Pending'),
    ('APPROVED', 'Approved'),
    ('FLAGGED', 'Flagged'),
    ('REJECTED', 'Rejected')
]

class EmissionRecord(models.Model):
    """
    THE canonical model. One row = one normalized emission event.
    This is the source of truth for carbon accounting.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # FIX APPLIED: String references used here to avoid NameErrors
    client = models.ForeignKey('Client', on_delete=models.CASCADE, related_name='emission_records')
    ingestion_job = models.ForeignKey('IngestionJob', on_delete=models.CASCADE, related_name='emission_records')

    # Source traceability
    source_type = models.CharField(max_length=50, choices=[('SAP', 'SAP'), ('UTILITY', 'Utility'), ('TRAVEL', 'Travel')])
    source_row_id = models.UUIDField()
    source_row_model = models.CharField(max_length=255)

    # GHG classification
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    category = models.CharField(max_length=255)

    # Activity data (normalized)
    activity_value = models.DecimalField(max_digits=20, decimal_places=6)
    activity_unit = models.CharField(max_length=50)
    activity_description = models.TextField()

    # Period
    activity_date = models.DateField()
    period_start = models.DateField()
    period_end = models.DateField()

    # Emission calculation
    emission_factor = models.DecimalField(max_digits=20, decimal_places=8)
    emission_factor_source = models.CharField(max_length=255)
    emission_factor_unit = models.CharField(max_length=50)
    co2e_tonnes = models.DecimalField(max_digits=20, decimal_places=8)
    calculation_method = models.CharField(max_length=255)

    # Site / geography
    site_code = models.CharField(max_length=255, blank=True)
    country_code = models.CharField(max_length=2, blank=True)

    # Review workflow
    review_status = models.CharField(max_length=50, choices=REVIEW_STATUS_CHOICES, default='PENDING')
    # FIX APPLIED: User is imported at the top, so it does not need quotes
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_emissions')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    is_locked = models.BooleanField(default=False)

    # Edit tracking
    is_manually_edited = models.BooleanField(default=False)
    original_values = models.JSONField(null=True, blank=True)

    # Anomaly detection flags
    is_flagged_anomaly = models.BooleanField(default=False)
    anomaly_reason = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    emission_factor_source = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )

    emission_factor_unit = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    calculation_method = models.TextField(
        blank=True,
        default=""
    )

    class Meta:
        ordering = ['-activity_date']
        indexes = [
            models.Index(fields=['client', 'scope', 'review_status']),
            models.Index(fields=['client', 'activity_date']),
            models.Index(fields=['ingestion_job']),
        ]

    def __str__(self):
        return f"EmissionRecord {self.id} - Scope {self.scope} ({self.co2e_tonnes} tCO2e)"


class EmissionFactor(models.Model):
    """
    Lookup table for emission factors.
    Seeded from DEFRA 2024 and EPA 2024 published tables.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    source_name = models.CharField(max_length=255)
    activity_type = models.CharField(max_length=255)
    fuel_type = models.CharField(max_length=255, blank=True)
    unit = models.CharField(max_length=50)
    factor_value = models.DecimalField(max_digits=20, decimal_places=8)
    factor_unit = models.CharField(max_length=50)
    region = models.CharField(max_length=255, blank=True)
    valid_from = models.DateField()
    valid_to = models.DateField(null=True, blank=True)
    ghg_protocol_category = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} - {self.source_name} ({self.factor_value} {self.factor_unit})"