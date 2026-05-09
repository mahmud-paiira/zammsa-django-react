from django.urls import path
from . import views

urlpatterns = [
    path('warehouse/', views.ProcurementWarehouseListView.as_view(), name='warehouse-list'),
    path('demand-forecasts/', views.DemandForecastListView.as_view(), name='forecast-list'),
    path('archives/', views.ArchivedProcurementFileListView.as_view(), name='archive-list'),
    path('archives/<uuid:pk>/', views.ArchivedProcurementFileDetailView.as_view(), name='archive-detail'),
    path('archives/add/', views.archive_add_view, name='archive-add'),
    path('archives/<uuid:pk>/legal-hold/', views.archive_legal_hold_view, name='archive-legal-hold'),
    path('archives/expiry-alerts/', views.archive_expiry_alerts_view, name='archive-expiry-alerts'),
    path('report-definitions/', views.ReportDefinitionListView.as_view(), name='report-def-list'),
    path('report-generations/', views.ReportGenerationListView.as_view(), name='report-gen-list'),
    path('dashboards/executive/', views.executive_dashboard_view, name='dashboard-executive'),
    path('dashboards/procurement/', views.procurement_dashboard_view, name='dashboard-procurement'),
    path('dashboards/financial/', views.financial_dashboard_view, name='dashboard-financial'),
    path('reports/generate/<str:report_type>/', views.generate_report_view, name='report-generate'),
    path('reports/zppa-xml/', views.zppa_xml_export_view, name='zppa-xml-export'),
    path('reports/zppa-submit/', views.zppa_submit_report_view, name='zppa-submit'),
    path('zppa-submissions/', views.ZPPASubmissionListView.as_view(), name='zppa-submission-list'),
    path('zppa-submissions/<uuid:pk>/', views.ZPPASubmissionDetailView.as_view(), name='zppa-submission-detail'),
]
