from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from .models import Supplier, VendorApplication, VendorApplicationDocument, SupplierPerformance, SupplierRiskScore


class VendorRegistrationWizardTests(APITestCase):
    def test_create_application_public(self):
        url = reverse('application-list')
        response = self.client.post(url, {
            'company_name': 'Test Supplier Ltd',
            'registration_number': 'REG-001',
            'tin': 'TIN-001',
            'ceec_category': 'citizen_owned',
            'email': 'vendor@test.com',
            'contact_person': 'John Doe',
            'contact_phone': '+260977000001',
            'bank_name': 'Bank of Zambia',
            'bank_account_number': '1234567890',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VendorApplication.objects.count(), 1)

    def test_save_step(self):
        app = VendorApplication.objects.create(
            company_name='Test Ltd', registration_number='REG-002',
            tin='TIN-002', ceec_category='citizen_owned',
        )
        url = reverse('application-step', args=[app.application_id, 3])
        response = self.client.post(url, {
            'contact_person': 'Jane Doe',
            'contact_phone': '+260977000002',
            'contact_email': 'jane@test.com',
            'address': '123 Lusaka',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.contact_person, 'Jane Doe')

    def test_submit_application_public(self):
        app = VendorApplication.objects.create(
            company_name='Test Ltd', registration_number='REG-003',
            tin='TIN-003', ceec_category='citizen_owned',
        )
        url = reverse('application-submit', args=[app.application_id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, 'submitted')
        self.assertIsNotNone(app.submitted_at)

    def test_upload_document(self):
        app = VendorApplication.objects.create(
            company_name='Test Ltd', registration_number='REG-004',
            tin='TIN-004', ceec_category='citizen_owned',
        )
        url = reverse('application-upload-document', args=[app.application_id])
        response = self.client.post(url, {
            'document_type': 'incorporation_certificate',
            'file_path': '/uploads/test.pdf',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(VendorApplicationDocument.objects.count(), 1)


class PACRACEECValidationTests(APITestCase):
    def test_validate_pacra(self):
        url = reverse('validate-pacra')
        response = self.client.post(url, {
            'tin': 'TIN-100',
            'company_name': 'Valid Co',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])

    def test_validate_pacra_missing_tin(self):
        url = reverse('validate-pacra')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_validate_ceec(self):
        url = reverse('validate-ceec')
        response = self.client.post(url, {
            'certificate_number': 'CEEC-001',
            'ceec_category': 'citizen_owned',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])

    def test_validate_ceec_missing_cert(self):
        url = reverse('validate-ceec')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ApplicationReviewTests(APITestCase):
    def setUp(self):
        self.srm_user = User.objects.create_user(
            employee_id='SRM001', full_name='SRM User',
            email='srm@test.gov.zm', password='testpass123',
            role='supplier_relationship_manager',
        )
        self.client.force_authenticate(user=self.srm_user)
        self.app = VendorApplication.objects.create(
            company_name='Approve Me Ltd', registration_number='REG-APP',
            tin='TIN-APP', ceec_category='citizen_owned',
            email='approve@test.com',
        )

    def test_approve_application_creates_supplier_and_user(self):
        url = reverse('application-review', args=[self.app.application_id])
        response = self.client.post(url, {'decision': 'approved'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.app.refresh_from_db()
        self.assertEqual(self.app.status, 'approved')
        self.assertTrue(Supplier.objects.filter(registration_number='REG-APP').exists())
        self.assertTrue(User.objects.filter(email='approve@test.com').exists())

    def test_reject_application(self):
        url = reverse('application-review', args=[self.app.application_id])
        response = self.client.post(url, {
            'decision': 'rejected',
            'rejection_reason': 'Incomplete documentation',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.app.refresh_from_db()
        self.assertEqual(self.app.status, 'rejected')
        self.assertEqual(self.app.rejection_reason, 'Incomplete documentation')

    def test_review_unauthenticated_blocked(self):
        self.client.force_authenticate(user=None)
        url = reverse('application-review', args=[self.app.application_id])
        response = self.client.post(url, {'decision': 'approved'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PerformanceEvaluationTests(APITestCase):
    def setUp(self):
        self.cm_user = User.objects.create_user(
            employee_id='CM001', full_name='Contract Manager',
            email='cm@test.gov.zm', password='testpass123',
            role='contract_manager',
        )
        self.client.force_authenticate(user=self.cm_user)
        self.supplier = Supplier.objects.create(
            registration_number='REG-PERF', tin='TIN-PERF',
            name='Perf Supplier',
        )
        self.evaluate_url = reverse('performance-evaluate', args=[self.supplier.supplier_id])

    def test_evaluate_good_performance(self):
        response = self.client.post(self.evaluate_url, {
            'overall_score': 85,
            'metrics': {'delivery': 90, 'quality': 85, 'compliance': 80, 'responsiveness': 85},
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['risk_level'], 'low')
        self.assertFalse(response.data['needs_improvement'])
        self.assertEqual(SupplierPerformance.objects.count(), 1)
        self.assertEqual(SupplierRiskScore.objects.count(), 1)
        self.supplier.refresh_from_db()
        self.assertEqual(float(self.supplier.risk_score), 15.0)

    def test_evaluate_poor_performance_sets_improvement_flag(self):
        response = self.client.post(self.evaluate_url, {
            'overall_score': 55,
            'metrics': {'delivery': 50, 'quality': 60, 'compliance': 55, 'responsiveness': 55},
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['risk_level'], 'high')
        self.assertTrue(response.data['needs_improvement'])
        perf = SupplierPerformance.objects.first()
        self.assertTrue(perf.needs_improvement)

    def test_evaluate_mid_performance(self):
        response = self.client.post(self.evaluate_url, {
            'overall_score': 70,
            'metrics': {'delivery': 70, 'quality': 70, 'compliance': 70, 'responsiveness': 70},
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['risk_level'], 'medium')

    def test_evaluate_supplier_not_found(self):
        url = reverse('performance-evaluate', args=['00000000-0000-0000-0000-000000000000'])
        response = self.client.post(url, {'overall_score': 80, 'metrics': {}}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class PerformanceReminderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            employee_id='REM001', full_name='Reminder User',
            email='rem@test.gov.zm', password='testpass123',
            role='contract_manager',
        )
        self.client.force_authenticate(user=self.user)

    def test_reminder_returns_suppliers_due(self):
        supplier = Supplier.objects.create(
            registration_number='REG-REM', tin='TIN-REM',
            name='No Eval Yet', status='active',
        )
        url = reverse('performance-reminder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_improvement_list(self):
        supplier = Supplier.objects.create(
            registration_number='REG-IMP', tin='TIN-IMP',
            name='Needs Help',
        )
        SupplierPerformance.objects.create(
            supplier=supplier, evaluation_date=timezone.now().date(),
            metrics={'delivery': 50}, overall_score=50,
            needs_improvement=True,
        )
        url = reverse('performance-improvement')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)


class SupplierCRUDTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            employee_id='SUPADM', full_name='Supplier Admin',
            email='supadm@test.gov.zm', password='testpass123',
            role='supplier_relationship_manager',
        )
        self.client.force_authenticate(user=self.user)

    def test_list_suppliers(self):
        Supplier.objects.create(registration_number='REG-L1', tin='TIN-L1', name='Supplier 1')
        Supplier.objects.create(registration_number='REG-L2', tin='TIN-L2', name='Supplier 2')
        url = reverse('supplier-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_create_supplier(self):
        url = reverse('supplier-list')
        response = self.client.post(url, {
            'registration_number': 'REG-NEW', 'tin': 'TIN-NEW',
            'name': 'New Supplier', 'ceec_category': 'citizen_owned',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_supplier_detail(self):
        supplier = Supplier.objects.create(
            registration_number='REG-DET', tin='TIN-DET', name='Detail Supplier',
        )
        url = reverse('supplier-detail', args=[supplier.supplier_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Detail Supplier')

    def test_supplier_soft_delete(self):
        supplier = Supplier.objects.create(
            registration_number='REG-DEL', tin='TIN-DEL', name='Delete Supplier',
        )
        url = reverse('supplier-detail', args=[supplier.supplier_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        supplier.refresh_from_db()
        self.assertEqual(supplier.status, 'suspended')
