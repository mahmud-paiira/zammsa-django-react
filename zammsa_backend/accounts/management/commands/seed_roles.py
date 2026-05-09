from django.core.management.base import BaseCommand
from accounts.models import Role, ROLE_CHOICES

ROLE_DESCRIPTIONS = {
    'system_admin': 'Full system access and configuration management',
    'director_procurement': 'Oversees procurement department operations',
    'director_general': 'Top-level approval and strategic oversight',
    'zpc_member': 'Zambia Procurement Commission oversight member',
    'procurement_officer': 'Handles procurement processes and tenders',
    'procurement_manager': 'Manages procurement team and operations',
    'finance_officer': 'Handles payment processing and financial verification',
    'budget_controller': 'Controls budget allocation and expenditure',
    'department_head': 'Approves department procurement requests',
    'user_dept_staff': 'Creates procurement requisitions',
    'evaluation_committee_member': 'Evaluates bids and proposals',
    'evaluation_committee_chair': 'Chairs evaluation committee sessions',
    'contract_manager': 'Manages contract lifecycle and compliance',
    'supplier_relationship_manager': 'Manages supplier relationships and performance',
    'supplier_user': 'Submits bids and manages supplier profile',
    'auditor': 'Reviews procurement processes for compliance',
    'zppa_reporting_officer': 'Handles ZPPA compliance reporting',
    'integration_manager': 'Manages system integrations with external systems',
    'public_portal_viewer': 'Read-only access to public procurement information',
}

ROLE_HIERARCHY = {
    'system_admin': 100,
    'director_general': 90,
    'director_procurement': 80,
    'zpc_member': 75,
    'procurement_manager': 70,
    'budget_controller': 65,
    'evaluation_committee_chair': 60,
    'contract_manager': 55,
    'department_head': 50,
    'supplier_relationship_manager': 45,
    'procurement_officer': 40,
    'finance_officer': 35,
    'evaluation_committee_member': 30,
    'integration_manager': 25,
    'auditor': 20,
    'zppa_reporting_officer': 15,
    'user_dept_staff': 10,
    'supplier_user': 5,
    'public_portal_viewer': 1,
}


class Command(BaseCommand):
    help = 'Seed all 19 roles from the SRS'

    def handle(self, *args, **options):
        for role_name, _ in ROLE_CHOICES:
            Role.objects.update_or_create(
                role_name=role_name,
                defaults={
                    'description': ROLE_DESCRIPTIONS.get(role_name, ''),
                    'hierarchy_level': ROLE_HIERARCHY.get(role_name, 0),
                }
            )
            self.stdout.write(self.style.SUCCESS(f'Role created: {role_name}'))
        self.stdout.write(self.style.SUCCESS('All 19 roles seeded successfully'))
