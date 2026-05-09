from django.urls import path
from . import views

urlpatterns = [
    path('endpoints/', views.IntegrationEndpointListView.as_view(), name='endpoint-list'),
    path('endpoints/<uuid:pk>/', views.IntegrationEndpointDetailView.as_view(), name='endpoint-detail'),
    path('logs/', views.IntegrationLogListView.as_view(), name='integration-log-list'),
    path('sync-status/', views.SyncStatusListView.as_view(), name='sync-status-list'),
    path('webhooks/', views.WebhookDeliveryListView.as_view(), name='webhook-list'),
    path('budget-validation/', views.call_budget_validation_view, name='budget-validation'),
    path('webhooks/wms/', views.wms_webhook_view, name='wms-webhook'),
]
