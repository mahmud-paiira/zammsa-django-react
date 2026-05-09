from django.utils import timezone
from django.db.models import Q
from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Department, FiscalYear, Commodity, UnitOfMeasure, FundingSource, DocumentTemplate, RiskLibrary, ApprovalMatrix, ChangeRequest
from .serializers import (
    DepartmentSerializer, DepartmentListSerializer, FiscalYearSerializer,
    CommoditySerializer, UnitOfMeasureSerializer, FundingSourceSerializer,
    DocumentTemplateSerializer, RiskLibrarySerializer, ApprovalMatrixSerializer,
    ChangeRequestSerializer, ChangeRequestApproveSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


class DepartmentFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    level = django_filters.CharFilter(lookup_expr='exact')
    is_active = django_filters.BooleanFilter()
    region = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Department
        fields = ['level', 'is_active', 'region']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(dept_name__icontains=value) | Q(dept_code__icontains=value) | Q(region__icontains=value)
        )


class FiscalYearFilter(django_filters.FilterSet):
    is_current = django_filters.BooleanFilter()
    is_closed = django_filters.BooleanFilter()

    class Meta:
        model = FiscalYear
        fields = ['is_current', 'is_closed']


class CommodityFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    category = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = Commodity
        fields = ['category', 'is_active', 'sub_category']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(commodity_name__icontains=value) | Q(commodity_code__icontains=value)
        )


class FundingSourceFilter(django_filters.FilterSet):
    type = django_filters.CharFilter(lookup_expr='exact')
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = FundingSource
        fields = ['type', 'is_active']


class DocumentTemplateFilter(django_filters.FilterSet):
    document_type = django_filters.CharFilter(lookup_expr='exact')
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = DocumentTemplate
        fields = ['document_type', 'is_active']


class RiskLibraryFilter(django_filters.FilterSet):
    risk_category = django_filters.CharFilter(lookup_expr='icontains')
    severity_level = django_filters.CharFilter(lookup_expr='exact')

    class Meta:
        model = RiskLibrary
        fields = ['risk_category', 'severity_level']


class ApprovalMatrixFilter(django_filters.FilterSet):
    procurement_type = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = ApprovalMatrix
        fields = ['procurement_type', 'is_active', 'requires_zpc']


class ChangeRequestFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(lookup_expr='exact')
    entity_type = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = ChangeRequest
        fields = ['status', 'entity_type']


class BaseModelViewSet:
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [IsAuthenticated]


class DepartmentListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = Department.objects.all()
    filterset_class = DepartmentFilter
    search_fields = ['dept_name', 'dept_code', 'region']
    ordering_fields = ['dept_name', 'level', 'region']
    ordering = ['dept_name']

    def get_serializer_class(self):
        if self.request.method == 'GET' and self.request.query_params.get('list', False):
            return DepartmentListSerializer
        return DepartmentSerializer


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_tree_view(request):
    departments = Department.objects.filter(parent_department__isnull=True, is_active=True).prefetch_related('children')
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)


class FiscalYearListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = FiscalYear.objects.all()
    serializer_class = FiscalYearSerializer
    filterset_class = FiscalYearFilter
    ordering = ['-year_code']


class FiscalYearDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FiscalYear.objects.all()
    serializer_class = FiscalYearSerializer
    permission_classes = [IsAuthenticated]


class UnitOfMeasureListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = UnitOfMeasure.objects.all()
    serializer_class = UnitOfMeasureSerializer
    search_fields = ['uom_code', 'uom_name']
    ordering_fields = ['uom_name', 'category']
    ordering = ['uom_name']


class UnitOfMeasureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UnitOfMeasure.objects.all()
    serializer_class = UnitOfMeasureSerializer
    permission_classes = [IsAuthenticated]


class CommodityListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = Commodity.objects.select_related('unit_of_measure').all()
    serializer_class = CommoditySerializer
    filterset_class = CommodityFilter
    search_fields = ['commodity_name', 'commodity_code']
    ordering_fields = ['commodity_name', 'category']
    ordering = ['commodity_name']


class CommodityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Commodity.objects.select_related('unit_of_measure').all()
    serializer_class = CommoditySerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class FundingSourceListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = FundingSource.objects.all()
    serializer_class = FundingSourceSerializer
    filterset_class = FundingSourceFilter
    search_fields = ['source_name', 'source_code']
    ordering_fields = ['source_name', 'type']
    ordering = ['source_name']


class FundingSourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FundingSource.objects.all()
    serializer_class = FundingSourceSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class DocumentTemplateListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = DocumentTemplate.objects.all()
    serializer_class = DocumentTemplateSerializer
    filterset_class = DocumentTemplateFilter
    search_fields = ['template_name']
    ordering_fields = ['template_name', 'document_type', 'version']
    ordering = ['template_name']


class DocumentTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DocumentTemplate.objects.all()
    serializer_class = DocumentTemplateSerializer
    permission_classes = [IsAuthenticated]


class RiskLibraryListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = RiskLibrary.objects.all()
    serializer_class = RiskLibrarySerializer
    filterset_class = RiskLibraryFilter
    search_fields = ['risk_category', 'risk_description']
    ordering_fields = ['risk_category', 'severity_level']
    ordering = ['risk_category']


class RiskLibraryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RiskLibrary.objects.all()
    serializer_class = RiskLibrarySerializer
    permission_classes = [IsAuthenticated]


class ApprovalMatrixListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = ApprovalMatrix.objects.all()
    serializer_class = ApprovalMatrixSerializer
    filterset_class = ApprovalMatrixFilter
    search_fields = ['procurement_type']
    ordering_fields = ['value_threshold_min', 'procurement_type']
    ordering = ['value_threshold_min']


class ApprovalMatrixDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ApprovalMatrix.objects.all()
    serializer_class = ApprovalMatrixSerializer
    permission_classes = [IsAuthenticated]


class ChangeRequestListView(BaseModelViewSet, generics.ListCreateAPIView):
    queryset = ChangeRequest.objects.select_related('requested_by', 'approved_by_first', 'approved_by_second').all()
    serializer_class = ChangeRequestSerializer
    filterset_class = ChangeRequestFilter
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class ChangeRequestDetailView(generics.RetrieveAPIView):
    queryset = ChangeRequest.objects.select_related('requested_by', 'approved_by_first', 'approved_by_second').all()
    serializer_class = ChangeRequestSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_request_approve_view(request, pk):
    try:
        change_request = ChangeRequest.objects.get(pk=pk)
    except ChangeRequest.DoesNotExist:
        return Response({'error': 'Change request not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ChangeRequestApproveSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user_role = request.user.role
    approved = serializer.validated_data['approve']

    if not approved:
        change_request.status = 'rejected'
        change_request.save()
        return Response({'message': 'Change request rejected'})

    if user_role == 'director_procurement' and change_request.status == 'pending':
        change_request.status = 'approved_first'
        change_request.approved_by_first = request.user
        change_request.save()
        return Response({'message': 'First approval granted. Waiting for ZPC approval.'})

    if user_role == 'zpc_member' and change_request.status == 'approved_first':
        change_request.status = 'approved'
        change_request.approved_by_second = request.user
        change_request.approved_at = timezone.now()
        change_request.save()
        return Response({'message': 'Change request fully approved and applied.'})

    return Response({'error': 'You are not authorized to approve at this stage'}, status=status.HTTP_403_FORBIDDEN)
