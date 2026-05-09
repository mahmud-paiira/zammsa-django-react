from django.urls import path
from . import views

urlpatterns = [
    path('departments/', views.DepartmentListView.as_view(), name='department-list'),
    path('departments/tree/', views.department_tree_view, name='department-tree'),
    path('departments/<uuid:pk>/', views.DepartmentDetailView.as_view(), name='department-detail'),
    path('fiscal-years/', views.FiscalYearListView.as_view(), name='fiscal-year-list'),
    path('fiscal-years/<uuid:pk>/', views.FiscalYearDetailView.as_view(), name='fiscal-year-detail'),
    path('units-of-measure/', views.UnitOfMeasureListView.as_view(), name='uom-list'),
    path('units-of-measure/<uuid:pk>/', views.UnitOfMeasureDetailView.as_view(), name='uom-detail'),
    path('commodities/', views.CommodityListView.as_view(), name='commodity-list'),
    path('commodities/<uuid:pk>/', views.CommodityDetailView.as_view(), name='commodity-detail'),
    path('funding-sources/', views.FundingSourceListView.as_view(), name='funding-source-list'),
    path('funding-sources/<uuid:pk>/', views.FundingSourceDetailView.as_view(), name='funding-source-detail'),
    path('document-templates/', views.DocumentTemplateListView.as_view(), name='template-list'),
    path('document-templates/<uuid:pk>/', views.DocumentTemplateDetailView.as_view(), name='template-detail'),
    path('risk-library/', views.RiskLibraryListView.as_view(), name='risk-list'),
    path('risk-library/<uuid:pk>/', views.RiskLibraryDetailView.as_view(), name='risk-detail'),
    path('approval-matrix/', views.ApprovalMatrixListView.as_view(), name='approval-matrix-list'),
    path('approval-matrix/<uuid:pk>/', views.ApprovalMatrixDetailView.as_view(), name='approval-matrix-detail'),
    path('change-requests/', views.ChangeRequestListView.as_view(), name='change-request-list'),
    path('change-requests/<uuid:pk>/', views.ChangeRequestDetailView.as_view(), name='change-request-detail'),
    path('change-requests/<uuid:pk>/approve/', views.change_request_approve_view, name='change-request-approve'),
]
