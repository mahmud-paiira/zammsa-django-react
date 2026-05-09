from django.core.management.base import BaseCommand
from master_data.models import Department, FiscalYear, UnitOfMeasure, FundingSource, RiskLibrary

PROVINCES = {
    'national': [
        {'code': 'MOH-NAT', 'name': 'Ministry of Health - National'},
    ],
    'provincial': [
        {'code': 'PROV-CENTRAL', 'name': 'Central Provincial Health Office'},
        {'code': 'PROV-COPPER', 'name': 'Copperbelt Provincial Health Office'},
        {'code': 'PROV-EASTERN', 'name': 'Eastern Provincial Health Office'},
        {'code': 'PROV-LUAPULA', 'name': 'Luapula Provincial Health Office'},
        {'code': 'PROV-LUSAKA', 'name': 'Lusaka Provincial Health Office'},
        {'code': 'PROV-MUCHINGA', 'name': 'Muchinga Provincial Health Office'},
        {'code': 'PROV-NORTHERN', 'name': 'Northern Provincial Health Office'},
        {'code': 'PROV-NWESTERN', 'name': 'North-Western Provincial Health Office'},
        {'code': 'PROV-SOUTHERN', 'name': 'Southern Provincial Health Office'},
        {'code': 'PROV-WESTERN', 'name': 'Western Provincial Health Office'},
    ],
    'district': [
        {'code': 'DIST-LUSAKA', 'name': 'Lusaka District Health Office', 'parent': 'PROV-LUSAKA'},
        {'code': 'DIST-CHONGWE', 'name': 'Chongwe District Health Office', 'parent': 'PROV-LUSAKA'},
        {'code': 'DIST-KAFUE', 'name': 'Kafue District Health Office', 'parent': 'PROV-LUSAKA'},
        {'code': 'DIST-KITWE', 'name': 'Kitwe District Health Office', 'parent': 'PROV-COPPER'},
        {'code': 'DIST-NDOLA', 'name': 'Ndola District Health Office', 'parent': 'PROV-COPPER'},
        {'code': 'DIST-MUfulira', 'name': 'Mufulira District Health Office', 'parent': 'PROV-COPPER'},
    ],
}

UOMS = [
    {'code': 'EA', 'name': 'Each', 'category': 'unit'},
    {'code': 'BOX', 'name': 'Box', 'category': 'packaging'},
    {'code': 'CARTON', 'name': 'Carton', 'category': 'packaging'},
    {'code': 'PACK', 'name': 'Pack', 'category': 'packaging'},
    {'code': 'BOTTLE', 'name': 'Bottle', 'category': 'liquid'},
    {'code': 'VIAL', 'name': 'Vial', 'category': 'liquid'},
    {'code': 'TABLET', 'name': 'Tablet', 'category': 'dosage'},
    {'code': 'CAPSULE', 'name': 'Capsule', 'category': 'dosage'},
    {'code': 'AMPOULE', 'name': 'Ampoule', 'category': 'injectable'},
    {'code': 'ML', 'name': 'Milliliter', 'category': 'volume'},
    {'code': 'L', 'name': 'Liter', 'category': 'volume'},
    {'code': 'KG', 'name': 'Kilogram', 'category': 'weight'},
    {'code': 'G', 'name': 'Gram', 'category': 'weight'},
    {'code': 'PAIR', 'name': 'Pair', 'category': 'unit'},
    {'code': 'SET', 'name': 'Set', 'category': 'unit'},
]

FUNDING_SOURCES = [
    {'code': 'GRZ-MOH', 'name': 'Government of Zambia - MoH', 'type': 'government', 'ref': 'GRZ-2026-MOH'},
    {'code': 'GRZ-MOH-COVID', 'name': 'MoH COVID-19 Response Fund', 'type': 'government', 'ref': 'GRZ-COVID-2026'},
    {'code': 'GLOBAL-FUND', 'name': 'The Global Fund', 'type': 'donor', 'ref': 'GF-ZM-2026'},
    {'code': 'USAID', 'name': 'USAID Zambia', 'type': 'donor', 'ref': 'USAID-ZM-2026'},
    {'code': 'WHO', 'name': 'World Health Organization', 'type': 'donor', 'ref': 'WHO-ZM-2026'},
    {'code': 'UNICEF', 'name': 'UNICEF Zambia', 'type': 'donor', 'ref': 'UNICEF-ZM-2026'},
    {'code': 'WORLD-BANK', 'name': 'World Bank - Health Sector', 'type': 'donor', 'ref': 'WB-ZM-HLTH-2026'},
    {'code': 'AFDB', 'name': 'African Development Bank', 'type': 'donor', 'ref': 'AFDB-ZM-2026'},
    {'code': 'GRZ-DONOR-POOL', 'name': 'Government/Donor Pooled Fund', 'type': 'other', 'ref': 'POOL-ZM-2026'},
]

RISKS = [
    {'cat': 'Supplier Default', 'desc': 'Supplier fails to deliver on contractual obligations', 'mit': 'Maintain supplier pre-qualification and backup supplier list', 'sev': 'high'},
    {'cat': 'Budget Shortfall', 'desc': 'Insufficient budget allocation for approved procurement', 'mit': 'Quarterly budget reviews and phased procurement planning', 'sev': 'high'},
    {'cat': 'Delivery Delay', 'desc': 'Goods delivered after required date', 'mit': 'Include penalty clauses and regular shipment tracking', 'sev': 'medium'},
    {'cat': 'Quality Non-Compliance', 'desc': 'Goods do not meet specified quality standards', 'mit': 'Pre-delivery inspection and quality assurance testing', 'sev': 'high'},
    {'cat': 'Currency Fluctuation', 'desc': 'Exchange rate changes impact import costs', 'mit': 'Include currency adjustment clauses in contracts', 'sev': 'medium'},
    {'cat': 'Regulatory Change', 'desc': 'Changes in procurement regulations affect process', 'mit': 'Regular legal updates and compliance training', 'sev': 'medium'},
    {'cat': 'Fraud/Corruption', 'desc': 'Unethical practices in procurement process', 'mit': 'Mandatory conflict of interest declarations and audit trails', 'sev': 'high'},
    {'cat': 'Single Source', 'desc': 'Only one supplier responds to tender', 'mit': 'Market research and supplier development programs', 'sev': 'medium'},
    {'cat': 'Specification Error', 'desc': 'Incorrect or ambiguous technical specifications', 'mit': 'Technical review committee and stakeholder consultation', 'sev': 'medium'},
    {'cat': 'Logistics Disruption', 'desc': 'Transport or storage issues affect supply chain', 'mit': 'Regional warehousing and multi-modal transport options', 'sev': 'low'},
]


class Command(BaseCommand):
    help = 'Seed master data: departments, fiscal years, UOMs, funding sources, risks'

    def handle(self, *args, **options):
        national, _ = Department.objects.get_or_create(
            dept_code='MOH-NAT',
            defaults={'dept_name': 'Ministry of Health - National', 'level': 'national', 'region': 'National'}
        )

        for prov in PROVINCES['provincial']:
            Department.objects.get_or_create(
                dept_code=prov['code'],
                defaults={
                    'dept_name': prov['name'],
                    'level': 'provincial',
                    'parent_department': national,
                    'region': prov['name'].replace(' Provincial Health Office', ''),
                }
            )
        self.stdout.write(f'Created {len(PROVINCES["provincial"])} provincial departments')

        prov_map = {p['code']: p for p in PROVINCES['provincial']}
        for dist in PROVINCES['district']:
            parent_code = dist['parent']
            parent_dept = Department.objects.filter(dept_code=parent_code).first()
            Department.objects.get_or_create(
                dept_code=dist['code'],
                defaults={
                    'dept_name': dist['name'],
                    'level': 'district',
                    'parent_department': parent_dept,
                    'region': parent_dept.region if parent_dept else '',
                }
            )
        self.stdout.write(f'Created {len(PROVINCES["district"])} district departments')

        for year_data in [
            {'code': 'FY2024', 'start': '2024-01-01', 'end': '2024-12-31', 'current': False},
            {'code': 'FY2025', 'start': '2025-01-01', 'end': '2025-12-31', 'current': False},
            {'code': 'FY2026', 'start': '2026-01-01', 'end': '2026-12-31', 'current': True},
            {'code': 'FY2027', 'start': '2027-01-01', 'end': '2027-12-31', 'current': False},
            {'code': 'FY2028', 'start': '2028-01-01', 'end': '2028-12-31', 'current': False},
        ]:
            from datetime import date
            FiscalYear.objects.get_or_create(
                year_code=year_data['code'],
                defaults={
                    'start_date': date.fromisoformat(year_data['start']),
                    'end_date': date.fromisoformat(year_data['end']),
                    'is_current': year_data['current'],
                }
            )
        self.stdout.write('Created 5 fiscal years (2024-2028)')

        for uom in UOMS:
            UnitOfMeasure.objects.get_or_create(
                uom_code=uom['code'],
                defaults={'uom_name': uom['name'], 'category': uom['category']}
            )
        self.stdout.write(f'Created {len(UOMS)} units of measure')

        for fs in FUNDING_SOURCES:
            FundingSource.objects.get_or_create(
                source_code=fs['code'],
                defaults={
                    'source_name': fs['name'],
                    'type': fs['type'],
                    'budget_reference': fs['ref'],
                }
            )
        self.stdout.write(f'Created {len(FUNDING_SOURCES)} funding sources')

        for risk in RISKS:
            RiskLibrary.objects.get_or_create(
                risk_category=risk['cat'],
                defaults={
                    'risk_description': risk['desc'],
                    'default_mitigation': risk['mit'],
                    'severity_level': risk['sev'],
                }
            )
        self.stdout.write(f'Created {len(RISKS)} risk entries')

        self.stdout.write(self.style.SUCCESS('Master data seeded successfully'))
