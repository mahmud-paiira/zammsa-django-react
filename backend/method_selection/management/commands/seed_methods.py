from django.core.management.base import BaseCommand
from method_selection.models import ProcurementMethodType, PreferenceScheme

METHODS = [
    {'code': 'open_tender', 'name': 'Open Tendering', 'min': 1000000, 'max': None, 'open': True},
    {'code': 'restricted', 'name': 'Restricted Tendering', 'min': 250000, 'max': 1000000, 'open': False},
    {'code': 'simplified', 'name': 'Simplified Bidding', 'min': 20001, 'max': 1000000, 'open': True},
    {'code': 'direct', 'name': 'Direct Procurement', 'min': 0, 'max': 20000, 'open': False},
    {'code': 'rfq', 'name': 'Request for Quotations', 'min': 0, 'max': 500000, 'open': True},
    {'code': 'proposal', 'name': 'Request for Proposals', 'min': 500000, 'max': None, 'open': True},
    {'code': 'competitive_dialogue', 'name': 'Competitive Dialogue', 'min': 1000000, 'max': None, 'open': False},
]

PREFERENCES = [
    {'name': 'Local Supplier Preference', 'cat': 'local', 'margin': 4, 'applies': 'all_procurement'},
    {'name': 'Citizen-Owned Enterprise Preference', 'cat': 'citizen', 'margin': 8, 'applies': 'all_procurement'},
    {'name': 'SME Preference', 'cat': 'sme', 'margin': 12, 'applies': 'all_procurement'},
    {'name': 'Women-Owned Business Preference', 'cat': 'gender', 'margin': 10, 'applies': 'all_procurement'},
    {'name': 'Youth-Owned Business Preference', 'cat': 'youth', 'margin': 10, 'applies': 'all_procurement'},
    {'name': 'Bidder Preference', 'cat': 'general', 'margin': 15, 'applies': 'all_procurement'},
]


class Command(BaseCommand):
    help = 'Seed procurement methods and preference schemes'

    def handle(self, *args, **options):
        for m in METHODS:
            ProcurementMethodType.objects.get_or_create(
                method_code=m['code'],
                defaults={
                    'method_name': m['name'],
                    'threshold_min': m['min'],
                    'threshold_max': m['max'],
                    'is_open': m['open'],
                }
            )
        self.stdout.write(f'Created {len(METHODS)} procurement methods')

        for p in PREFERENCES:
            PreferenceScheme.objects.get_or_create(
                scheme_name=p['name'],
                defaults={
                    'category': p['cat'],
                    'margin_percentage': p['margin'],
                    'applies_to': p['applies'],
                }
            )
        self.stdout.write(f'Created {len(PREFERENCES)} preference schemes')

        self.stdout.write(self.style.SUCCESS('Methods and preferences seeded'))
