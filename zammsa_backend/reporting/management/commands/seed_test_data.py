from decimal import Decimal
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction



class Command(BaseCommand):
    help = 'Seed comprehensive test data for all workflow testing'

    def handle(self, *args, **options):
        self.stdout.write('=== Seeding Test Data ===')

        self._seed_users()
        self._seed_budget_allocations()
        self._seed_sample_app()
        self._seed_supplier()
        self._seed_reporting_data()

        self.stdout.write(self.style.SUCCESS('Done! All test data seeded.'))

    # -------------------------------------------------------------------
    # 1. Users
    # -------------------------------------------------------------------
    def _seed_users(self):
        from accounts.models import User

        users = [
            ('SA-001', 'System Admin',       'admin@zammsa.zm',       'Test@123',  'system_admin',        'ICT',             True),
            ('DG-001', 'Director General',    'dg@zammsa.zm',         'Test@123',  'director_general',    'HQ',              True),
            ('DP-001', 'Director Procurement','dirproc@zammsa.zm',    'Test@123',  'director_procurement','Procurement',     True),
            ('PM-001', 'Procurement Manager', 'pm@zammsa.zm',         'Test@123',  'procurement_manager', 'Procurement',     True),
            ('PO-001', 'Procurement Officer', 'po@zammsa.zm',         'Test@123',  'procurement_officer', 'Procurement',     True),
            ('DH-001', 'Dept Head Health',    'dh@zammsa.zm',         'Test@123',  'department_head',     'Health Programmes', True),
            ('US-001', 'User Staff',          'staff@zammsa.zm',      'Test@123',  'user_dept_staff',     'Health Programmes', True),
            ('FO-001', 'Finance Officer',     'fo@zammsa.zm',         'Test@123',  'finance_officer',     'Finance',         True),
            ('BC-001', 'Budget Controller',   'bc@zammsa.zm',         'Test@123',  'budget_controller',   'Finance',         True),
            ('ZPC-001','ZPC Member',          'zpc@zammsa.zm',        'Test@123',  'zpc_member',          'Procurement',     True),
            ('EC-001', 'EC Chair',            'ecchair@zammsa.zm',    'Test@123',  'evaluation_committee_chair', 'Procurement', True),
            ('EC-002', 'EC Member 1',         'ecm1@zammsa.zm',       'Test@123',  'evaluation_committee_member', 'Procurement', True),
            ('CM-001', 'Contract Manager',    'cm@zammsa.zm',         'Test@123',  'contract_manager',    'Procurement',     True),
            ('ZR-001', 'ZPPA Reporter',       'zppa@zammsa.zm',       'Test@123',  'zppa_reporting_officer','Procurement',   True),
            ('AU-001', 'Auditor',             'auditor@zammsa.zm',    'Test@123',  'auditor',             'Audit',           True),
        ]

        created = 0
        already = 0
        for emp_id, name, email, pwd, role, dept, staff in users:
            _, is_new = User.objects.get_or_create(
                email=email,
                defaults={
                    'employee_id': emp_id,
                    'full_name': name,
                    'role': role,
                    'department': dept,
                    'is_staff': staff,
                },
            )
            if is_new:
                u = User.objects.get(email=email)
                u.set_password(pwd)
                u.save()
                created += 1
            else:
                already += 1

        # Create supplier user separately (it gets a real UUID in its email)
        sup_email = 'vendor@healthpharma.zm'
        _, is_new = User.objects.get_or_create(
            email=sup_email,
            defaults={
                'employee_id': 'SUP-REG-2026-001',
                'full_name': 'HealthPharma Ltd',
                'role': 'supplier_user',
                'department': 'Supplier',
            },
        )
        if is_new:
            u = User.objects.get(email=sup_email)
            u.set_password('Vendor@123')
            u.save()
            created += 1
        else:
            already += 1

        self.stdout.write(f'  Users: {created} created, {already} already exist')

    # -------------------------------------------------------------------
    # 2. Budget Allocations
    # -------------------------------------------------------------------
    def _seed_budget_allocations(self):
        from finance.models import BudgetAllocation
        from master_data.models import FiscalYear

        fy = FiscalYear.objects.filter(is_current=True).first()
        if not fy:
            fy = FiscalYear.objects.order_by('-start_date').first()
        if not fy:
            self.stdout.write('  SKIP BudgetAllocations: no fiscal year found')
            return

        allocations = [
            ('department', 'DEPT-HLTH', 'Health Programmes',  Decimal('5000000')),
            ('department', 'DEPT-FIN',  'Finance',            Decimal('2000000')),
            ('department', 'DEPT-ICT',  'ICT',                Decimal('3000000')),
        ]

        created = 0
        for level, code, name, amount in allocations:
            _, is_new = BudgetAllocation.objects.get_or_create(
                entity_code=code,
                fiscal_year=fy.year_code,
                defaults={
                    'entity_level': level,
                    'entity_name': name,
                    'allocated_amount': amount,
                    'encumbered_amount': Decimal('0'),
                    'expended_amount': Decimal('0'),
                },
            )
            if is_new:
                created += 1

        self.stdout.write(f'  BudgetAllocations: {created} created')

    # -------------------------------------------------------------------
    # 3. Sample Annual Procurement Plan
    # -------------------------------------------------------------------
    def _seed_sample_app(self):
        from decimal import Decimal
        from procurement_planning.models import AnnualProcurementPlan, APPLineItem
        from master_data.models import Department, FiscalYear, FundingSource, Commodity
        from accounts.models import User

        fy = FiscalYear.objects.filter(is_current=True).first()
        if not fy:
            fy = FiscalYear.objects.order_by('-start_date').first()
        dept = Department.objects.filter(dept_code__in=['MOH-NAT', 'PROV-LUSAKA']).first()
        if not fy or not dept:
            self.stdout.write('  SKIP APP: missing fiscal year or department')
            return

        staff = User.objects.filter(role='user_dept_staff').first()
        dh = User.objects.filter(role='department_head').first()

        app, is_new = AnnualProcurementPlan.objects.get_or_create(
            fiscal_year=fy,
            department=dept,
            defaults={
                'status': 'draft',
                'submitted_by': staff,
                'submitted_at': timezone.now() - timedelta(days=5),
                'total_estimated_value': Decimal('270000'),
            },
        )

        if is_new:
            funding = FundingSource.objects.filter(source_code='GRZ-MOH').first()
            commodities = list(Commodity.objects.filter(
                commodity_code__in=['MED-PAR-001', 'MED-AMO-001', 'MED-ART-001']
            )[:3])

            items_data = [
                ('Paracetamol 500mg Tablets - 1000 packs', Decimal('150000'), funding, commodities[0] if len(commodities) > 0 else None),
                ('Amoxicillin 250mg Capsules - 500 packs', Decimal('120000'), funding, commodities[1] if len(commodities) > 1 else None),
            ]

            for desc, val, fs, cm in items_data:
                APPLineItem.objects.create(
                    app=app,
                    description=desc,
                    estimated_value=val,
                    funding_source=fs,
                    commodity=cm,
                    recommended_method='open_tender' if val > 100000 else 'simplified',
                )

            self.stdout.write(f'  APP+LineItems created (status=draft)')
        else:
            self.stdout.write(f'  APP already exists')

    # -------------------------------------------------------------------
    # 4. Approved Supplier
    # -------------------------------------------------------------------
    def _seed_supplier(self):
        from suppliers.models import Supplier
        from accounts.models import User

        sup, is_new = Supplier.objects.get_or_create(
            registration_number='REG-2026-001',
            defaults={
                'tin': 'TIN-1000001',
                'name': 'HealthPharma Ltd',
                'ceec_category': 'citizen_owned',
                'status': 'active',
                'risk_score': Decimal('15.00'),
                'risk_level': 'low',
            },
        )

        if is_new:
            # Create supplier user if not already seeded
            email = 'vendor@healthpharma.zm'
            if not User.objects.filter(email=email).exists():
                User.objects.create_user(
                    email=email,
                    password='Vendor@123',
                    employee_id=f'SUP-{sup.registration_number}',
                    full_name=sup.name,
                    role='supplier_user',
                    department='Supplier',
                )
            self.stdout.write(f'  Supplier created: HealthPharma Ltd')
        else:
            self.stdout.write(f'  Supplier already exists')

    # -------------------------------------------------------------------
    # 5. Reporting Data (ProcurementWarehouse + ZPPASubmission)
    # -------------------------------------------------------------------
    def _seed_reporting_data(self):
        from decimal import Decimal
        from datetime import date
        from reporting.models import ProcurementWarehouse, ReportDefinition, ReportGeneration, ZPPASubmission
        from accounts.models import User

        # -- Warehouse records --
        warehouse_data = [
            ('PROC-2026-001', Decimal('150000'), 'open_tender',    date(2026, 3, 15), 'local',   'Health Programmes', 'active',    45),
            ('PROC-2026-002', Decimal('120000'), 'simplified',     date(2026, 4, 10), 'citizen_owned', 'Health Programmes', 'completed', 30),
            ('PROC-2026-003', Decimal('250000'), 'open_tender',    date(2026, 5, 1),  'foreign', 'Finance',           'active',    60),
            ('PROC-2026-004', Decimal('80000'),  'direct',         date(2026, 2, 20), 'local',   'ICT',               'completed', 15),
            ('PROC-2026-005', Decimal('500000'), 'open_tender',    date(2026, 6, 1),  'citizen_empowered', 'Health Programmes', 'active', 75),
        ]

        wh_created = 0
        for pid, val, method, adate, cat, dept, status, days in warehouse_data:
            _, is_new = ProcurementWarehouse.objects.get_or_create(
                procurement_id=pid,
                defaults={
                    'value': val,
                    'method': method,
                    'award_date': adate,
                    'supplier_category': cat,
                    'department': dept,
                    'status': status,
                    'processing_days': days,
                },
            )
            if is_new:
                wh_created += 1

        if wh_created:
            self.stdout.write(f'  ProcurementWarehouse: {wh_created} created')
        else:
            self.stdout.write(f'  ProcurementWarehouse: already exists')

        # -- Report Definition --
        report, is_new = ReportDefinition.objects.get_or_create(
            report_name='Quarterly Procurement Report',
            defaults={
                'report_type': 'quarterly',
                'schedule': '0 6 1 * *',
                'format': 'xlsx',
                'recipient_list': ['zppa@zppa.org.zm'],
            },
        )
        if is_new:
            self.stdout.write('  ReportDefinition: created')

        # -- Report Generation --
        gen, is_new = ReportGeneration.objects.get_or_create(
            report=report,
            defaults={'status': 'generated', 'file_path': '/reports/quarterly_2026_q1.xlsx'},
        )
        if is_new:
            self.stdout.write('  ReportGeneration: created')

        # -- ZPPA Submission --
        zppa_user = User.objects.filter(role='zppa_reporting_officer').first()
        sub, is_new = ZPPASubmission.objects.get_or_create(
            report=report,
            status='submitted',
            defaults={
                'generation': gen,
                'submitted_by': zppa_user,
                'zppa_reference': 'ZPPA-20260401-001',
                'response_message': 'Report submitted to ZPPA successfully',
                'submission_data': {
                    'submitted_at': timezone.now().isoformat(),
                    'report_name': report.report_name,
                },
            },
        )
        if is_new:
            self.stdout.write('  ZPPASubmission: created')
