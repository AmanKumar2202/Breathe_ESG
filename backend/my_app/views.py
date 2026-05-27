import csv
import json
from datetime import datetime
from decimal import Decimal

from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.http import StreamingHttpResponse
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination

from django_filters.rest_framework import DjangoFilterBackend

from my_app.permissions import RoleBasedPermission
from my_app.models import AuditLog
from my_app.models import IngestionJob

from .models import EmissionRecord

from .serializers import (
    IngestionJobSerializer,
    EmissionRecordSerializer,
    EmissionRecordUpdateSerializer,
    ReviewActionSerializer,
    AuditLogSerializer
)

try:
    from backend.my_app.sap_parser import SAPParser
    from backend.my_app.utility_parser import UtilityParser
    from backend.my_app.travel_parser import TravelParser
except ImportError:
    pass


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "message": "Welcome to the Breathe ESG API",
    })


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000


class IngestionJobViewSet(viewsets.ModelViewSet):
    permission_classes = [RoleBasedPermission]

    serializer_class = IngestionJobSerializer
    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend]

    filterset_fields = [
        'source_type',
        'status',
    ]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'profile') and user.profile.client:
            return (
                IngestionJob.objects
                .filter(client=user.profile.client)
                .order_by('-started_at')
            )

        if user.is_superuser:
            return (
                IngestionJob.objects
                .all()
                .order_by('-started_at')
            )

        return IngestionJob.objects.none()

    def create(self, request, *args, **kwargs):

        user_role = request.user.profile.role

        if user_role == "analyst":
            return Response(
                {
                    "detail":
                    "Analysts cannot ingest data."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if user_role == "auditor":
            return Response(
                {
                    "detail":
                    "Auditors cannot ingest data."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        client = request.user.profile.client

        source_type = request.data.get('source_type')

        if not source_type:
            return Response(
                {
                    "error":
                    "source_type is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        file_obj = request.FILES.get('file')

        if not file_obj and source_type != 'TRAVEL':
            return Response(
                {
                    "error":
                    "file is required for this source_type"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        job = IngestionJob.objects.create(
            client=client,
            source_type=source_type,
            status='PROCESSING',
            file_name=(
                file_obj.name
                if file_obj
                else 'json_payload'
            ),
            initiated_by=request.user,
            raw_payload_ref='local_or_s3_path_mock'
        )

        try:
            if source_type == 'SAP':
                parser = SAPParser()
                parser.parse(file_obj, job)

            elif source_type == 'UTILITY':
                parser = UtilityParser()
                parser.parse(file_obj, job)

            elif source_type == 'TRAVEL':
                parser = TravelParser()

                if file_obj:
                    parser.parse(file_obj, job)
                else:
                    payload = request.data.get(
                        'payload',
                        {}
                    )

                    if isinstance(payload, str):
                        payload = json.loads(payload)

                    parser.parse(payload, job)

            job.refresh_from_db()

            job.status = (
                'COMPLETED'
                if job.row_count_failed == 0
                else 'PARTIAL'
            )

            if (
                job.row_count_success == 0
                and job.row_count_failed > 0
            ):
                job.status = 'FAILED'

            job.completed_at = timezone.now()

            job.save()

        except Exception as e:

            job.status = 'FAILED'

            job.completed_at = timezone.now()

            job.error_log.append({
                "error": str(e)
            })

            job.save()

        serializer = self.get_serializer(job)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):

        job = self.get_object()

        job.status = 'PENDING'

        job.save()

        return Response({
            "status":
            "Job reset to PENDING for retry."
        })


class Echo:
    def write(self, value):
        return value


class EmissionRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [RoleBasedPermission]

    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend]

    filterset_fields = [
        'scope',
        'source_type',
        'review_status',
        'site_code',
        'is_flagged_anomaly'
    ]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'profile') and user.profile.client:
            return EmissionRecord.objects.filter(
                client=user.profile.client
            )

        if user.is_superuser:
            return EmissionRecord.objects.all()

        return EmissionRecord.objects.none()

    def get_serializer_class(self):
        if self.action in ['partial_update', 'update']:
            return EmissionRecordUpdateSerializer

        return EmissionRecordSerializer

    def perform_update(self, serializer):

        user_role = self.request.user.profile.role

        if user_role == 'auditor':
            raise PermissionDenied(
                "Auditors cannot edit records."
            )

        instance = self.get_object()

        if instance.is_locked:
            raise PermissionDenied(
                "Cannot edit a locked record."
            )

        before_state = {
            'activity_value': str(instance.activity_value),
            'activity_unit': instance.activity_unit,
            'activity_description': instance.activity_description
        }

        updated_instance = serializer.save()

        after_state = {
            'activity_value': str(updated_instance.activity_value),
            'activity_unit': updated_instance.activity_unit,
            'activity_description': updated_instance.activity_description
        }

        AuditLog.objects.create(
            client=updated_instance.client,
            actor=self.request.user,
            action='ROW_EDITED',
            target_model='EmissionRecord',
            target_id=updated_instance.id,
            details={
                "before": before_state,
                "after": after_state
            },
            notes=serializer.validated_data.get(
                'review_notes',
                ''
            )
        )

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):

        user_role = request.user.profile.role

        if user_role == 'auditor':
            raise PermissionDenied(
                "Auditors cannot perform reviews."
            )

        instance = self.get_object()

        if instance.is_locked:
            return Response(
                {"error": "Record is locked"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ReviewActionSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        action_type = serializer.validated_data['action']

        notes = serializer.validated_data.get(
            'review_notes',
            ''
        )

        before_status = instance.review_status

        if action_type == 'APPROVE':
            instance.review_status = 'APPROVED'
            instance.is_locked = True

        elif action_type == 'FLAG':
            instance.review_status = 'FLAGGED'
            instance.is_flagged_anomaly = True
            instance.anomaly_reason = notes

        elif action_type == 'REJECT':
            instance.review_status = 'REJECTED'

        instance.reviewed_by = request.user

        instance.reviewed_at = timezone.now()

        if notes:
            instance.review_notes = notes

        instance.save()

        AuditLog.objects.create(
            client=instance.client,
            actor=request.user,
            action=f'ROW_{action_type}',
            target_model='EmissionRecord',
            target_id=instance.id,
            details={
                "before": {
                    "review_status": before_status
                },
                "after": {
                    "review_status": instance.review_status
                }
            },
            notes=notes
        )

        return Response(
            EmissionRecordSerializer(instance).data
        )

    @action(detail=False, methods=['post'])
    def bulk_review(self, request):

        user_role = request.user.profile.role

        if user_role == 'auditor':
            raise PermissionDenied(
                "Auditors cannot perform reviews."
            )

        record_ids = request.data.get(
            'record_ids',
            []
        )

        action_type = request.data.get('action')

        notes = request.data.get(
            'review_notes',
            ''
        )

        if (
            not record_ids
            or action_type not in [
                'APPROVE',
                'FLAG',
                'REJECT'
            ]
        ):
            return Response(
                {"error": "Invalid data"},
                status=status.HTTP_400_BAD_REQUEST
            )

        records = self.get_queryset().filter(
            id__in=record_ids,
            is_locked=False
        )

        updated_count = 0

        for instance in records:

            before_status = instance.review_status

            if action_type == 'APPROVE':
                instance.review_status = 'APPROVED'
                instance.is_locked = True

            elif action_type == 'FLAG':
                instance.review_status = 'FLAGGED'
                instance.is_flagged_anomaly = True
                instance.anomaly_reason = notes

            elif action_type == 'REJECT':
                instance.review_status = 'REJECTED'

            instance.reviewed_by = request.user

            instance.reviewed_at = timezone.now()

            if notes:
                instance.review_notes = notes

            instance.save()

            AuditLog.objects.create(
                client=instance.client,
                actor=request.user,
                action=f'ROW_{action_type}',
                target_model='EmissionRecord',
                target_id=instance.id,
                details={
                    "before": {
                        "review_status": before_status
                    },
                    "after": {
                        "review_status": instance.review_status
                    }
                },
                notes=notes
            )

            updated_count += 1

        return Response({
            "status":
            f"{updated_count} records updated."
        })

    @action(detail=False, methods=['get'])
    def export(self, request):

        qs = self.filter_queryset(
            self.get_queryset()
        )

        def iter_items():

            pseudo_buffer = Echo()

            writer = csv.writer(
                pseudo_buffer
            )

            yield writer.writerow([
                'ID',
                'Source',
                'Scope',
                'Category',
                'Activity Date',
                'Value',
                'Unit',
                'tCO2e',
                'Status'
            ])

            for record in qs:

                yield writer.writerow([
                    record.id,
                    record.source_type,
                    record.scope,
                    record.category,
                    record.activity_date,
                    record.activity_value,
                    record.activity_unit,
                    record.co2e_tonnes,
                    record.review_status
                ])

        response = StreamingHttpResponse(
            iter_items(),
            content_type="text/csv"
        )

        response[
            'Content-Disposition'
        ] = 'attachment; filename="emissions_export.csv"'

        return response


class DashboardViewSet(viewsets.ViewSet):

    permission_classes = [RoleBasedPermission]

    @action(detail=False, methods=['get'])
    def summary(self, request):

        profile = request.user.profile.role

        if not profile:
            return Response(
                {
                    "error":
                    "User profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        client = request.user.profile.client

        qs = EmissionRecord.objects.filter(
            client=client
        )

        scope_totals = qs.values(
            'scope'
        ).annotate(
            total=Sum('co2e_tonnes')
        )

        co2e_by_scope = {
            f"scope{item['scope']}":
            float(item['total'] or 0)
            for item in scope_totals
        }

        source_totals = qs.values(
            'source_type'
        ).annotate(
            total=Sum('co2e_tonnes')
        )

        co2e_by_source = {
            item['source_type']:
            float(item['total'] or 0)
            for item in source_totals
        }

        status_counts = qs.values(
            'review_status'
        ).annotate(
            count=Count('id')
        )

        review_status_counts = {
            item['review_status']:
            item['count']
            for item in status_counts
        }

        months = (
            qs.annotate(
                month=TruncMonth('activity_date')
            )
            .values('month', 'scope')
            .annotate(
                co2e=Sum('co2e_tonnes')
            )
            .order_by('month')
        )

        records_by_month = []

        for m in months:

            if m['month']:

                records_by_month.append({
                    "month":
                    m['month'].strftime('%Y-%m'),
                    "co2e":
                    float(m['co2e'] or 0),
                    "scope":
                    m['scope']
                })

        anomaly_count = qs.filter(
            is_flagged_anomaly=True
        ).count()

        latest_jobs = (
            IngestionJob.objects
            .filter(client=client)
            .order_by('-started_at')[:5]
        )

        jobs_data = IngestionJobSerializer(
            latest_jobs,
            many=True
        ).data

        return Response({
            "total_co2e_by_scope": co2e_by_scope,
            "total_co2e_by_source": co2e_by_source,
            "review_status_counts": review_status_counts,
            "records_by_month": records_by_month,
            "anomaly_count": anomaly_count,
            "latest_jobs": jobs_data,
        })


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):

    permission_classes = [RoleBasedPermission]

    serializer_class = AuditLogSerializer

    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend]

    filterset_fields = [
        'target_id',
        'action',
        'actor',
    ]

    def get_queryset(self):

        user = self.request.user

        if hasattr(user, "profile"):

            return (
                AuditLog.objects
                .filter(client=user.profile.client)
                .select_related("actor")
                .order_by("-timestamp")
            )

        return (
            AuditLog.objects
            .all()
            .select_related("actor")
            .order_by("-timestamp")
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):

    user = request.user

    if hasattr(user, 'profile') and user.profile.client:

        client = user.profile.client

        records = EmissionRecord.objects.filter(
            client=client
        )

        jobs = IngestionJob.objects.filter(
            client=client
        )

    elif user.is_superuser:

        records = EmissionRecord.objects.all()

        jobs = IngestionJob.objects.all()

    else:

        records = EmissionRecord.objects.none()

        jobs = IngestionJob.objects.none()

    scope_1 = (
        records.filter(scope='1')
        .aggregate(total=Sum('co2e_tonnes'))['total']
        or 0
    )

    scope_2 = (
        records.filter(scope='2')
        .aggregate(total=Sum('co2e_tonnes'))['total']
        or 0
    )

    scope_3 = (
        records.filter(scope='3')
        .aggregate(total=Sum('co2e_tonnes'))['total']
        or 0
    )

    pending = records.filter(
        review_status='PENDING'
    ).count()

    approved = records.filter(
        review_status='APPROVED'
    ).count()

    flagged = records.filter(
        review_status='FLAGGED'
    ).count()

    monthly_qs = (
        records.annotate(
            month=TruncMonth('activity_date')
        )
        .values('month')
        .annotate(
            total=Sum('co2e_tonnes')
        )
        .order_by('month')
    )

    records_by_month = [
        {
            "month":
            item['month'].strftime('%b %Y')
            if item['month']
            else "Unknown",

            "emissions":
            float(item['total'] or 0)
        }
        for item in monthly_qs
    ]

    data = {
        "total_co2e_by_scope": {
            "Scope 1": float(scope_1),
            "Scope 2": float(scope_2),
            "Scope 3": float(scope_3),
        },

        "review_status_counts": {
            "PENDING": pending,
            "APPROVED": approved,
            "FLAGGED": flagged,
        },

        "anomaly_count":
        records.filter(
            is_flagged_anomaly=True
        ).count(),

        "records_by_month":
        records_by_month,

        "latest_jobs":
        IngestionJobSerializer(
            jobs.order_by('-started_at')[:5],
            many=True
        ).data
    }

    return Response(data)