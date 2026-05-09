from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Seed default admin user'

    def handle(self, *args, **options):
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
        self.stdout.write(self.style.SUCCESS('Admin user ready: admin@zammsa.gov.zm / Test@123'))
