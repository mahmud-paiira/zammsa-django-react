from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed all initial data for ZAMMSA e-Procurement system'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Force re-seeding')

    def handle(self, *args, **options):
        if options['force']:
            self.stdout.write(self.style.WARNING('Force flag set. Flushing existing data...'))
            call_command('flush', '--no-input')

        self.stdout.write('Step 1/8: Seeding roles...')
        call_command('seed_roles')
        self.stdout.write(self.style.SUCCESS('Roles seeded'))

        self.stdout.write('Step 2/8: Seeding permissions...')
        call_command('seed_permissions')
        self.stdout.write(self.style.SUCCESS('Permissions seeded'))

        self.stdout.write('Step 3/8: Seeding master data...')
        call_command('seed_master_data')
        self.stdout.write(self.style.SUCCESS('Master data seeded'))

        self.stdout.write('Step 4/8: Seeding commodities...')
        call_command('seed_commodities')
        self.stdout.write(self.style.SUCCESS('Commodities seeded'))

        self.stdout.write('Step 5/8: Seeding procurement methods...')
        call_command('seed_methods')
        self.stdout.write(self.style.SUCCESS('Procurement methods seeded'))

        self.stdout.write('Step 6/8: Seeding test users...')
        call_command('seed_test_users')
        self.stdout.write(self.style.SUCCESS('Test users seeded'))

        self.stdout.write('Step 7/8: Seeding system configuration...')
        call_command('seed_system_config')
        self.stdout.write(self.style.SUCCESS('System configuration seeded'))

        self.stdout.write('Step 8/8: Seeding procurement plans...')
        try:
            call_command('seed_procurement_planning')
            self.stdout.write(self.style.SUCCESS('Procurement plans seeded'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Procurement plan seeding skipped: {e}'))

        self.stdout.write('Ensuring admin superuser exists...')
        admin, created = User.objects.update_or_create(
            email='admin@zammsa.gov.zm',
            defaults={
                'employee_id': 'ADMIN001',
                'full_name': 'System Administrator',
                'role': 'system_admin',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        admin.set_password('Test@123')
        admin.save()
        self.stdout.write(self.style.SUCCESS('Admin superuser ready: admin@zammsa.gov.zm / Test@123'))

        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('All seeding complete!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('Login: admin@zammsa.gov.zm / Test@123')
