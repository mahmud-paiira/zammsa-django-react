import json
from decimal import Decimal
from datetime import timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from .models import (
    ProcurementWarehouse, DemandForecast, ArchivedProcurementFile,
    ReportDefinition, ReportGeneration, ZPPASubmission,
)


class ExecutiveDashboardTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            employee_id='ADM-001', full_name='Admin', email='admin@test.com',
            password='testpass123', role='director_general',
        )
        self.client.force_authenticate(user=self.user)
        for i in range(5):
            ProcurementWarehouse.objects.create(
                procurement_id=f'PROC-00{i}',
                value=Decimal(f'{1000 * (i + 1)}'),
                method='open' if i % 2 == 0 else 'direct',
                department=f'Dept {chr(65 + i)}',
                status='active' if i < 3 else 'completed',
                processing_days=30 + i * 5,
                supplier_category='local' if i % 2 == 0 else 'foreign',
            )

    def test_executive_dashboard_returns_kpis(self):
        url = reverse('dashboard-executive')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertIn('total_value', data)
        self.assertIn('total_procurements', data)
        self.assertIn('avg_processing_days', data)
        self.assertIn('completion_rate', data)
        self.assertIn('active_procurements', data)
        self.assertIn('by_method', data)
        self.assertIn('by_department', data)
        self.assertIn('by_status', data)
        self.assertIn('by_supplier_category', data)
        self.assertEqual(data['total_procurements'], 5)
        self.assertEqual(data['active_procurements'], 5)

    def test_executive_dashboard_requires_auth(self):
        self.client.force_authenticate(user=None)
        url = reverse('dashboard-executive')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProcurementDashboardTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            employee_id='ADM-002', full_name='Manager', email='mgr@test.com',
            password='testpass123', role='procurement_manager',
        )
        self.client.force_authenticate(user=self.user)
        for i in range(4):
            ProcurementWarehouse.objects.create(
                procurement_id=f'PD-00{i}',
                value=Decimal(f'{2000 * (i + 1)}'),
                method='open',
                department='Health',
                status='active',
                processing_days=20 + i * 10,
                supplier_category='local',
            )

    def test_procurement_dashboard_returns_metrics(self):
        url = reverse('dashboard-procurement')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertIn('by_status', data)
        self.assertIn('average_processing_days', data)
        self.assertIn('max_processing_days', data)
        self.assertIn('by_method', data)
        self.assertIn('by_supplier_category', data)
        self.assertIn('by_department', data)
        self.assertGreater(data['max_processing_days'], 0)

    def test_procurement_dashboard_requires_auth(self):
        self.client.force_authenticate(user=None)
        url = reverse('dashboard-procurement')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class FinancialDashboardTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            employee_id='ADM-003', full_name='Finance', email='fin@test.com',
            password='testpass123', role='finance_officer',
        )
        self.client.force_authenticate(user=self.user)
        ProcurementWarehouse.objects.create(
            procurement_id='FIN-001', value=Decimal('50000'),
            method='open', department='Finance', status='completed',
        )

    def test_financial_dashboard(self):
        url = reverse('dashboard-financial')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_procurement_value', response.data)
        self.assertIn('budget_utilization_by_dept', response.data)


class ReportGenerationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            employee_id='ADM-004', full_name='Reporter', email='rep@test.com',
            password='testpass123', role='zppa_reporting_officer',
        )
        self.client.force_authenticate(user=self.user)
        for i in range(3):
            ProcurementWarehouse.objects.create(
                procurement_id=f'RPT-00{i}',
                value=Decimal(f'{3000 * (i + 1)}'),
                method='open',
                department='Health',
                status='active',
                processing_days=25,
            )

    def test_generate_quarterly_excel(self):
        url = reverse('report-generate', args=['quarterly'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        self.assertIn('quarterly_procurement_report.xlsx', response['Content-Disposition'])

    def test_generate_direct_bidding_excel(self):
        url = reverse('report-generate', args=['direct_bidding'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_generate_zppa_quarterly_excel(self):
        url = reverse('report-generate', args=['zppa_quarterly'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_generate_unknown_type(self):
        url = reverse('report-generate', args=['unknown'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_generate_report_requires_auth(self):
        self.client.force_authenticate(user=None)
        url = reverse('report-generate', args=['quarterly'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ZPPAXmlExportTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            employee_id='ADM-005', full_name='ZPPA Officer', email='zppa@test.com',
            password='testpass123', role='zppa_reporting_officer',
        )
        self.client.force_authenticate(user=self.user)
        ProcurementWarehouse.objects.create(
            procurement_id='XML-001', value=Decimal('10000'),
            method='open', department='Health', status='active',
            processing_days=30, supplier_category='local',
            award_date=timezone.now().date(),
        )

    def test_zppa_xml_export(self):
        url = reverse('zppa-xml-export')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/xml')
        self.assertIn('zppa_quarterly_report.xml', response['Content-Disposition'])
        self.assertIn(b'ZPPAQuarterlyReport', response.content)
        self.assertIn(b'ZAMMSA', response.content)
        self.assertIn(b'XML-001', response.content)
        self.assertIn(b'10000', response.content)

    def test_zppa_xml_requires_auth(self):
        self.client.force_authenticate(user=None)
        url = reverse('zppa-xml-export')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ZPPASubmissionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            employee_id='ADM-006', full_name='ZPPA Reporter', email='zppa2@test.com',
            password='testpass123', role='zppa_reporting_officer',
        )
        self.client.force_authenticate(user=self.user)
        self.report = ReportDefinition.objects.create(
            report_name='Q1 Report', report_type='quarterly',
            schedule='0 6 1 * *', format='xlsx',
        )

    def test_submit_report_success(self):
        url = reverse('zppa-submit')
        response = self.client.post(url, {'report_id': str(self.report.report_id)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'submitted')
        self.assertIn('zppa_reference', response.data)
        self.assertTrue(response.data['zppa_reference'].startswith('ZPPA-'))
        self.assertEqual(ZPPASubmission.objects.count(), 1)

    def test_submit_report_missing_id(self):
        url = reverse('zppa-submit')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_submit_report_not_found(self):
        url = reverse('zppa-submit')
        from uuid import uuid4
        response = self.client.post(url, {'report_id': str(uuid4())}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_submissions(self):
        ZPPASubmission.objects.create(
            report=self.report, submitted_by=self.user, status='submitted',
            zppa_reference='ZPPA-REF-001',
        )
        url = reverse('zppa-submission-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_submission_detail(self):
        sub = ZPPASubmission.objects.create(
            report=self.report, submitted_by=self.user, status='submitted',
            zppa_reference='ZPPA-REF-002',
        )
        url = reverse('zppa-submission-detail', args=[sub.submission_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['zppa_reference'], 'ZPPA-REF-002')

    def test_submit_requires_auth(self):
        self.client.force_authenticate(user=None)
        url = reverse('zppa-submit')
        response = self.client.post(url, {'report_id': str(self.report.report_id)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ETLTaskTests(TestCase):
    def test_etl_data_warehouse_task_runs(self):
        from reporting.tasks.etl import etl_data_warehouse
        result = etl_data_warehouse()
        self.assertIn('ETL complete', result)

    def test_generate_quarterly_report_task(self):
        from reporting.tasks.etl import generate_quarterly_report_task
        result = generate_quarterly_report_task()
        self.assertIn('Quarterly report generated', result)
        self.assertEqual(ReportDefinition.objects.filter(report_type='quarterly').count(), 1)
        self.assertEqual(ReportGeneration.objects.count(), 1)

    def test_check_retention_expiry_task(self):
        from reporting.tasks.etl import check_retention_expiry
        ArchivedProcurementFile.objects.create(
            procurement_id='ARCH-TEST',
            file_path='/tmp/test.pdf',
            retention_expiry=timezone.now().date() + timedelta(days=30),
        )
        result = check_retention_expiry()
        self.assertIn('files expiring', result)

    def test_sync_external_systems_task(self):
        from reporting.tasks.etl import sync_external_systems
        result = sync_external_systems()
        self.assertIn('Synced', result)


class WarehouseModelTests(TestCase):
    def test_create_warehouse_record(self):
        record = ProcurementWarehouse.objects.create(
            procurement_id='WH-001',
            value=Decimal('25000'),
            method='open',
            department='Health',
            status='active',
            processing_days=45,
            supplier_category='local',
        )
        self.assertEqual(str(record), 'Fact WH-001')
        self.assertEqual(record.supplier_category, 'local')

    def test_warehouse_ordering(self):
        ProcurementWarehouse.objects.create(
            procurement_id='WH-002', value=Decimal('100'),
            method='direct', department='Admin', status='completed',
            award_date=timezone.now().date() - timedelta(days=10),
        )
        ProcurementWarehouse.objects.create(
            procurement_id='WH-003', value=Decimal('200'),
            method='open', department='Health', status='active',
            award_date=timezone.now().date(),
        )
        qs = ProcurementWarehouse.objects.all()
        self.assertGreaterEqual(qs[0].award_date or timezone.now().date(), qs[1].award_date or timezone.now().date())


class ManagementCommandTests(TestCase):
    def test_run_etl_command(self):
        from django.core.management import call_command
        from io import StringIO
        out = StringIO()
        call_command('run_etl', stdout=out)
        self.assertIn('ETL complete', out.getvalue())

    def test_seed_reporting_schedules_command(self):
        from django.core.management import call_command
        from io import StringIO
        out = StringIO()
        call_command('seed_reporting_schedules', stdout=out)
        output = out.getvalue()
        self.assertIn('ETL Data Warehouse', output)
        self.assertIn('Generate Quarterly Report', output)
