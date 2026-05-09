from django.core.management.base import BaseCommand
from django_celery_beat.models import CrontabSchedule, PeriodicTask
import json


class Command(BaseCommand):
    help = 'Seed Celery Beat periodic schedules for reporting'

    def handle(self, *args, **options):
        daily_cron, _ = CrontabSchedule.objects.get_or_create(
            minute='0',
            hour='2',
            day_of_month='*',
            month_of_year='*',
            day_of_week='*',
        )
        PeriodicTask.objects.get_or_create(
            name='ETL Data Warehouse - Daily 2 AM',
            defaults={
                'crontab': daily_cron,
                'task': 'reporting.tasks.etl.etl_data_warehouse',
                'kwargs': json.dumps({}),
            },
        )
        self.stdout.write(self.style.SUCCESS('Created/verified: ETL Data Warehouse - Daily 2 AM'))

        monthly_cron, _ = CrontabSchedule.objects.get_or_create(
            minute='0',
            hour='6',
            day_of_month='1',
            month_of_year='*',
            day_of_week='*',
        )
        PeriodicTask.objects.get_or_create(
            name='Generate Quarterly Procurement Report - 1st of Month',
            defaults={
                'crontab': monthly_cron,
                'task': 'reporting.tasks.etl.generate_quarterly_report_task',
                'kwargs': json.dumps({}),
            },
        )
        self.stdout.write(self.style.SUCCESS('Created/verified: Generate Quarterly Report - 1st of Month'))
