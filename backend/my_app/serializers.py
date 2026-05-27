from rest_framework import serializers
from .models import Client, AuditLog
from .models import IngestionJob
from .models import EmissionRecord

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'name', 'slug']

class IngestionJobSerializer(serializers.ModelSerializer):
    initiated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = IngestionJob
        # fields = ['id', 'source_type', 'status', 'file_name', 'row_count_total', 
        #           'row_count_success', 'row_count_failed', 'initiated_by_name', 
        #           'started_at', 'metadata']
        fields = '__all__'

    def get_initiated_by_name(self, obj):
        return obj.initiated_by.username if obj.initiated_by else None

class EmissionRecordSerializer(serializers.ModelSerializer):
    source_display = serializers.CharField(source='get_source_type_display', read_only=True)
    period_label = serializers.SerializerMethodField()
    is_editable = serializers.SerializerMethodField()

    class Meta:
        model = EmissionRecord
        fields = '__all__'

    def get_period_label(self, obj):
        return obj.activity_date.strftime("%b %Y") if obj.activity_date else ""

    def get_is_editable(self, obj):
        return not obj.is_locked and obj.review_status in ['PENDING', 'FLAGGED']

class EmissionRecordUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmissionRecord
        fields = ['activity_value', 'activity_unit', 'activity_description', 'activity_date', 'review_notes']
        
    def update(self, instance, validated_data):
        if not instance.original_values:
            instance.original_values = {
                'activity_value': str(instance.activity_value),
                'activity_unit': instance.activity_unit,
                'activity_description': instance.activity_description,
                'activity_date': instance.activity_date.isoformat() if instance.activity_date else None,
                'review_notes': instance.review_notes
            }
        
        instance.is_manually_edited = True
        return super().update(instance, validated_data)

class ReviewActionSerializer(serializers.Serializer):
    ACTION_CHOICES = [('APPROVE', 'Approve'), ('FLAG', 'Flag'), ('REJECT', 'Reject')]
    action = serializers.ChoiceField(choices=ACTION_CHOICES)
    review_notes = serializers.CharField(required=False, allow_blank=True)

class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog

        fields = [
            'id',
            'actor_name',
            'action',
            'target_model',
            'target_id',
            'timestamp',
            'notes',
        ]

    def get_actor_name(self, obj):
        return (
            obj.actor.username
            if obj.actor
            else "System"
        )