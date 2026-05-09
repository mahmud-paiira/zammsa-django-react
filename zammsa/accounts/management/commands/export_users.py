import csv
import openpyxl
from django.core.management.base import BaseCommand
from django.http import HttpResponse
from accounts.models import User


class Command(BaseCommand):
    help = 'Export users to CSV or Excel file'

    def add_arguments(self, parser):
        parser.add_argument('output_path', type=str, help='Output file path')
        parser.add_argument('--format', type=str, choices=['csv', 'xlsx'], help='File format (default: derived from extension)')

    def handle(self, *args, **options):
        output_path = options['output_path']
        fmt = options.get('format')

        if not fmt:
            if output_path.endswith('.csv'):
                fmt = 'csv'
            elif output_path.endswith('.xlsx'):
                fmt = 'xlsx'
            else:
                fmt = 'csv'

        headers = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Role', 'Is Active', 'Last Login']
        users = User.objects.all().values_list(
            'employee_id', 'full_name', 'email', 'phone', 'department', 'role', 'is_active', 'last_login'
        )

        if fmt == 'csv':
            with open(output_path, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
                writer.writerows(users)
        else:
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.append(headers)
            for user in users:
                ws.append(list(user))
            wb.save(output_path)

        self.stdout.write(self.style.SUCCESS(f'Exported {users.count()} users to {output_path}'))
