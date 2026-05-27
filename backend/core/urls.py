from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import views explicitly from your app
from my_app import views
from my_app.views import (
    api_root, 
    IngestionJobViewSet, 
    EmissionRecordViewSet, 
    DashboardViewSet, 
    AuditLogViewSet
)

# Initialize the DRF Router
router = DefaultRouter()
router.register(r'jobs', IngestionJobViewSet, basename='job')
router.register(r'records', EmissionRecordViewSet, basename='record')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'audit', AuditLogViewSet, basename='audit')

urlpatterns = [
    # Django Admin Panel
    path('admin/', admin.site.urls),
    
    # Base API Root
    path('', api_root, name='api-root'),
    
    # JWT Authentication Endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Custom Endpoints (MUST be defined before the router to prevent conflicts)
    path('api/dashboard/summary/', views.dashboard_summary, name='dashboard-summary'),
    
    # Router URLs (Handles all the basic GET, POST, PUT, DELETE for your viewsets)
    path('api/', include(router.urls)),
]