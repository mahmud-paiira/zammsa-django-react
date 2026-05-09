from decimal import Decimal
from datetime import timedelta
from django.db.models import Q, Count, Sum, Avg, Max
from django.utils import timezone
from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import ProcurementWarehouse, DemandForecast, ArchivedProcurementFile, ReportDefinition, ReportGeneration, ZPPASubmission
from .serializers import (
    ProcurementWarehouseSerializer, DemandForecastSerializer,
    ArchivedProcurementFileSerializer, ReportDefinitionSerializer, ReportGenerationSerializer,
    ZPPASubmissionSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


class BaseView:
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [IsAuthenticated]


class ProcurementWarehouseListView(BaseView, generics.ListAPIView):
    queryset = ProcurementWarehouse.objects.all()
    serializer_class = ProcurementWarehouseSerializer
    ordering = ['-award_date']


class DemandForecastListView(BaseView, generics.ListCreateAPIView):
    queryset = DemandForecast.objects.all()
    serializer_class = DemandForecastSerializer
    ordering = ['item_code']


class ArchivedProcurementFileListView(BaseView, generics.ListCreateAPIView):
    queryset = ArchivedProcurementFile.objects.all()
    serializer_class = ArchivedProcurementFileSerializer
    ordering = ['-archived_at']


class ArchivedProcurementFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ArchivedProcurementFile.objects.all()
    serializer_class = ArchivedProcurementFileSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def archive_add_view(request):
    serializer = ArchivedProcurementFileSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({'message': 'File archived', 'data': serializer.data}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def archive_legal_hold_view(request, pk):
    try:
        af = ArchivedProcurementFile.objects.get(pk=pk)
    except ArchivedProcurementFile.DoesNotExist:
        return Response({'error': 'Archive not found'}, status=404)
    af.legal_hold = not af.legal_hold
    af.save()
    return Response({'message': f'Legal hold {"enabled" if af.legal_hold else "disabled"}'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def archive_expiry_alerts_view(request):
    threshold = int(request.query_params.get('days', 90))
    cutoff = timezone.now().date() + timedelta(days=threshold)
    expiring = ArchivedProcurementFile.objects.filter(
        retention_expiry__lte=cutoff, legal_hold=False
    ).values('retention_expiry', 'procurement_id')
    return Response({
        'threshold_days': threshold,
        'expiring_count': expiring.count(),
        'expiring_files': list(expiring),
    })


class ReportDefinitionListView(BaseView, generics.ListCreateAPIView):
    queryset = ReportDefinition.objects.all()
    serializer_class = ReportDefinitionSerializer
    search_fields = ['report_name', 'report_type']
    ordering = ['report_name']


class ReportGenerationListView(BaseView, generics.ListAPIView):
    queryset = ReportGeneration.objects.select_related('report').all()
    serializer_class = ReportGenerationSerializer
    ordering = ['-generated_at']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def executive_dashboard_view(request):
    qs = ProcurementWarehouse.objects.all()
    total_value = qs.aggregate(v=Sum('value'))['v'] or 0
    total_count = qs.count()
    avg_days = qs.aggregate(d=Avg('processing_days'))['d'] or 0

    by_method = qs.values('method').annotate(
        count=Count('fact_id'), value=Sum('value')
    ).order_by('-value')

    by_dept = qs.values('department').annotate(
        count=Count('fact_id'), value=Sum('value')
    ).order_by('-value')[:10]

    by_status = qs.values('status').annotate(
        count=Count('fact_id'), value=Sum('value')
    )

    by_supplier_category = qs.values('supplier_category').annotate(
        count=Count('fact_id'), value=Sum('value')
    ).order_by('-value')

    active_count = qs.filter(status__in=['active', 'completed']).count()
    completion_rate = round((active_count / total_count * 100), 1) if total_count else 0

    return Response({
        'total_value': float(total_value),
        'total_procurements': total_count,
        'avg_processing_days': float(avg_days),
        'completion_rate': completion_rate,
        'active_procurements': active_count,
        'by_method': list(by_method),
        'by_department': list(by_dept),
        'by_status': list(by_status),
        'by_supplier_category': list(by_supplier_category),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def procurement_dashboard_view(request):
    qs = ProcurementWarehouse.objects.all()

    by_status = qs.values('status').annotate(
        count=Count('fact_id'), value=Sum('value')
    )
    avg_time = qs.aggregate(avg=Avg('processing_days'))['avg'] or 0

    by_method = qs.values('method').annotate(
        count=Count('fact_id'), value=Sum('value')
    ).order_by('-count')

    by_supplier_category = qs.values('supplier_category').annotate(
        count=Count('fact_id'), value=Sum('value')
    ).order_by('-count')

    by_dept = qs.values('department').annotate(
        count=Count('fact_id'), value=Sum('value'), avg_days=Avg('processing_days')
    ).order_by('-value')

    max_days = qs.aggregate(m=Max('processing_days'))['m'] or 0

    return Response({
        'by_status': list(by_status),
        'average_processing_days': float(avg_time),
        'max_processing_days': int(max_days),
        'by_method': list(by_method),
        'by_supplier_category': list(by_supplier_category),
        'by_department': list(by_dept),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def financial_dashboard_view(request):
    total = ProcurementWarehouse.objects.aggregate(v=Sum('value'))['v'] or 0
    by_dept = ProcurementWarehouse.objects.values('department').annotate(
        value=Sum('value')
    ).order_by('-value')

    return Response({
        'total_procurement_value': float(total),
        'budget_utilization_by_dept': list(by_dept),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_report_view(request, report_type):
    import openpyxl
    from django.http import HttpResponse

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f'{report_type} Report'

    warehouse = ProcurementWarehouse.objects.all().values_list(
        'procurement_id', 'value', 'method', 'department', 'status', 'processing_days', 'supplier_category'
    )

    if report_type == 'quarterly':
        ws.append(['Procurement ID', 'Value', 'Method', 'Department', 'Status', 'Processing Days', 'Supplier Category'])
        for row in warehouse:
            ws.append(list(row))
        filename = 'quarterly_procurement_report.xlsx'
    elif report_type == 'direct_bidding':
        direct = [r for r in warehouse if r[2] == 'direct']
        ws.append(['Procurement ID', 'Value', 'Department', 'Status', 'Processing Days'])
        for row in direct:
            ws.append([row[0], row[1], row[3], row[4], row[5]])
        filename = 'direct_bidding_report.xlsx'
    elif report_type == 'contract_amendments':
        ws.append(['Procurement ID', 'Value', 'Department', 'Status'])
        for row in warehouse:
            ws.append([row[0], row[1], row[3], row[4]])
        filename = 'contract_amendments_report.xlsx'
    elif report_type == 'zppa_quarterly':
        ws.append(['Procurement ID', 'Value', 'Method', 'Department', 'Status', 'Processing Days', 'Supplier Category'])
        for row in warehouse:
            ws.append(list(row))
        ws.append([])
        totals = ProcurementWarehouse.objects.aggregate(
            total=Sum('value'), count=Count('fact_id'), avg=Avg('processing_days')
        )
        ws.append(['TOTAL VALUE', float(totals['total'] or 0)])
        ws.append(['TOTAL PROCUREMENTS', totals['count']])
        ws.append(['AVG PROCESSING DAYS', float(totals['avg'] or 0)])
        filename = 'zppa_quarterly_report.xlsx'
    else:
        return Response({'error': 'Unknown report type'}, status=400)

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename={filename}'
    wb.save(response)
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def zppa_xml_export_view(request):
    from django.http import HttpResponse
    import xml.etree.ElementTree as ET
    from xml.dom import minidom

    root = ET.Element('ZPPAQuarterlyReport')
    root.set('xmlns', 'http://www.zppa.org.zm/reporting')
    root.set('generated_at', timezone.now().isoformat())

    header = ET.SubElement(root, 'ReportHeader')
    ET.SubElement(header, 'Agency').text = 'ZAMMSA'
    ET.SubElement(header, 'ReportType').text = 'QUARTERLY'
    ET.SubElement(header, 'Period').text = timezone.now().strftime('%Y-Q%m')
    ET.SubElement(header, 'GeneratedAt').text = timezone.now().isoformat()

    summary = ET.SubElement(root, 'Summary')
    totals = ProcurementWarehouse.objects.aggregate(
        total_value=Sum('value'), total_count=Count('fact_id'), avg_days=Avg('processing_days')
    )
    ET.SubElement(summary, 'TotalProcurements').text = str(totals['total_count'] or 0)
    ET.SubElement(summary, 'TotalValue').text = str(float(totals['total_value'] or 0))
    ET.SubElement(summary, 'AverageProcessingDays').text = str(round(float(totals['avg_days'] or 0), 1))

    procurements = ET.SubElement(root, 'Procurements')
    for item in ProcurementWarehouse.objects.all().values(
        'procurement_id', 'value', 'method', 'department', 'status', 'processing_days', 'supplier_category', 'award_date'
    ):
        p = ET.SubElement(procurements, 'Procurement')
        ET.SubElement(p, 'ProcurementID').text = str(item['procurement_id'])
        ET.SubElement(p, 'Value').text = str(float(item['value']))
        ET.SubElement(p, 'Method').text = item['method'] or ''
        ET.SubElement(p, 'Department').text = item['department'] or ''
        ET.SubElement(p, 'Status').text = item['status'] or ''
        ET.SubElement(p, 'ProcessingDays').text = str(item['processing_days'] or '')
        ET.SubElement(p, 'SupplierCategory').text = item['supplier_category'] or ''
        ET.SubElement(p, 'AwardDate').text = str(item['award_date'] or '')

    xml_str = minidom.parseString(ET.tostring(root, encoding='unicode')).toprettyxml(indent='  ')
    response = HttpResponse(xml_str, content_type='application/xml')
    response['Content-Disposition'] = 'attachment; filename=zppa_quarterly_report.xml'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def zppa_submit_report_view(request):
    report_id = request.data.get('report_id')
    generation_id = request.data.get('generation_id')

    if not report_id:
        return Response({'error': 'report_id is required'}, status=400)

    try:
        report = ReportDefinition.objects.get(pk=report_id)
    except ReportDefinition.DoesNotExist:
        return Response({'error': 'Report not found'}, status=404)

    generation = None
    if generation_id:
        try:
            generation = ReportGeneration.objects.get(pk=generation_id)
        except ReportGeneration.DoesNotExist:
            return Response({'error': 'Report generation not found'}, status=404)

    submission = ZPPASubmission.objects.create(
        report=report,
        generation=generation,
        submitted_by=request.user,
        status='submitted',
        response_message='Report submitted to ZPPA successfully',
        zppa_reference=f'ZPPA-{timezone.now().strftime("%Y%m%d%H%M%S")}-{report.report_id.hex[:8].upper()}',
        submission_data={
            'submitted_at': timezone.now().isoformat(),
            'submitted_by': str(request.user.id),
            'report_name': report.report_name,
            'generation_id': str(generation.generation_id) if generation else None,
        },
    )

    serializer = ZPPASubmissionSerializer(submission)
    return Response(serializer.data, status=201)


class ZPPASubmissionListView(BaseView, generics.ListCreateAPIView):
    queryset = ZPPASubmission.objects.select_related('report', 'submitted_by').all()
    serializer_class = ZPPASubmissionSerializer
    ordering = ['-submitted_at']


class ZPPASubmissionDetailView(generics.RetrieveAPIView):
    queryset = ZPPASubmission.objects.select_related('report', 'submitted_by').all()
    serializer_class = ZPPASubmissionSerializer
    permission_classes = [IsAuthenticated]
