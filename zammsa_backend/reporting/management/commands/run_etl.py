from django.core.management.base import BaseCommand
from reporting.tasks.etl import etl_data_warehouse


class Command(BaseCommand):
    help = 'Run the ETL data warehouse refresh'

    def handle(self, *args, **options):
        self.stdout.write('Starting ETL data warehouse refresh...')
        result = etl_data_warehouse()
        self.stdout.write(self.style.SUCCESS(result))
