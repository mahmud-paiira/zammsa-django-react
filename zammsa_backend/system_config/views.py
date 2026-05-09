from django.db.models import Q
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import SystemSetting, NotificationTemplate, ThresholdRule, PreferenceRule, WorkflowStage, ScheduledTask, IntegrationEndpoint
from .serializers import (
    SystemSettingSerializer, NotificationTemplateSerializer, ThresholdRuleSerializer,
    PreferenceRuleSerializer, WorkflowStageSerializer, ScheduledTaskSerializer, IntegrationEndpointSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page': self.page.number,
            'page_size': self.page.paginator.per_page,
            'total_pages': self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
        })


class BaseModelViewSet:
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [IsAuthenticated]


class SystemSettingFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(lookup_expr='icontains')
    data_type = django_filters.CharFilter(lookup_expr='exact')

    class Meta:
        model = SystemSetting
        fields = ['category', 'data_type']


class NotificationTemplateFilter(django_filters.FilterSet):
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = NotificationTemplate
        fields = ['is_active']


class ThresholdRuleFilter(django_filters.FilterSet):
    applies_to = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = ThresholdRule
        fields = ['applies_to', 'is_active']


class PreferenceRuleFilter(django_filters.FilterSet):
    is_current = django_filters.BooleanFilter()

    class Meta:
        model = PreferenceRule
        fields = ['is_current']


class WorkflowStageFilter(django_filters.FilterSet):
    workflow_name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = WorkflowStage
        fields = ['workflow_name']


class SystemSettingListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    filterset_class = SystemSettingFilter
    ordering_fields = ['category', 'setting_key']
    ordering = ['category', 'setting_key']


class SystemSettingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [IsAuthenticated]


class NotificationTemplateListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    filterset_class = NotificationTemplateFilter
    search_fields = ['template_key', 'subject_template']
    ordering = ['template_key']


class NotificationTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]


class ThresholdRuleListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = ThresholdRule.objects.all()
    serializer_class = ThresholdRuleSerializer
    filterset_class = ThresholdRuleFilter
    ordering = ['min_value']


class ThresholdRuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ThresholdRule.objects.all()
    serializer_class = ThresholdRuleSerializer
    permission_classes = [IsAuthenticated]


class PreferenceRuleListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = PreferenceRule.objects.all()
    serializer_class = PreferenceRuleSerializer
    filterset_class = PreferenceRuleFilter
    search_fields = ['preference_key', 'preference_name']
    ordering = ['preference_key']


class PreferenceRuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PreferenceRule.objects.all()
    serializer_class = PreferenceRuleSerializer
    permission_classes = [IsAuthenticated]


class WorkflowStageListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = WorkflowStage.objects.all()
    serializer_class = WorkflowStageSerializer
    filterset_class = WorkflowStageFilter
    ordering = ['workflow_name', 'stage_order']


class WorkflowStageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkflowStage.objects.all()
    serializer_class = WorkflowStageSerializer
    permission_classes = [IsAuthenticated]


class ScheduledTaskListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = ScheduledTask.objects.all()
    serializer_class = ScheduledTaskSerializer
    search_fields = ['task_name', 'task_type']
    ordering = ['task_name']


class ScheduledTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ScheduledTask.objects.all()
    serializer_class = ScheduledTaskSerializer
    permission_classes = [IsAuthenticated]


class IntegrationEndpointListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = IntegrationEndpoint.objects.all()
    serializer_class = IntegrationEndpointSerializer
    search_fields = ['system_name', 'endpoint_url']
    ordering = ['system_name']


class IntegrationEndpointDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = IntegrationEndpoint.objects.all()
    serializer_class = IntegrationEndpointSerializer
    permission_classes = [IsAuthenticated]
