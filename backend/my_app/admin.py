from django.contrib import admin
from .models import EmissionRecord, EmissionFactor

@admin.register(EmissionRecord)
class EmissionRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'scope', 'category', 'activity_date', 'co2e_tonnes', 'review_status')
    list_filter = ('scope', 'review_status', 'source_type', 'is_flagged_anomaly', 'client')
    search_fields = ('id', 'client__name', 'activity_description', 'site_code')
    date_hierarchy = 'activity_date'
    readonly_fields = ('original_values', 'created_at', 'updated_at')

@admin.register(EmissionFactor)
class EmissionFactorAdmin(admin.ModelAdmin):
    list_display = ('name', 'source_name', 'activity_type', 'factor_value', 'unit', 'region')
    list_filter = ('source_name', 'activity_type', 'region')
    search_fields = ('name', 'fuel_type', 'ghg_protocol_category')
    date_hierarchy = 'valid_from'