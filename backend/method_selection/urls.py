from django.urls import path
from . import views

urlpatterns = [
    path('methods/', views.ProcurementMethodTypeListView.as_view(), name='method-list'),
    path('methods/<uuid:pk>/', views.ProcurementMethodTypeDetailView.as_view(), name='method-detail'),
    path('recommendations/', views.MethodRecommendationListView.as_view(), name='recommendation-list'),
    path('recommendations/<uuid:pk>/', views.MethodRecommendationDetailView.as_view(), name='recommendation-detail'),
    path('recommendations/recommend/', views.recommend_method_view, name='method-recommend'),
    path('overrides/', views.MethodOverrideListView.as_view(), name='override-list'),
    path('justifications/', views.NonOpenJustificationListView.as_view(), name='justification-list'),
    path('justifications/<uuid:pk>/', views.NonOpenJustificationDetailView.as_view(), name='justification-detail'),
    path('preferences/', views.PreferenceSchemeListView.as_view(), name='preference-list'),
    path('preferences/<uuid:pk>/', views.PreferenceSchemeDetailView.as_view(), name='preference-detail'),
]
