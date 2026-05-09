from django.core.management.base import BaseCommand
from procurement_planning.models import AnnualProcurementPlan, APPLineItem
from master_data.models import FiscalYear, Department, FundingSource, Commodity


class Command(BaseCommand):
    help = 'Seed sample annual procurement plans'

    def handle(self, *args, **options):
        fy = FiscalYear.objects.filter(is_current=True).first()
        if not fy:
            self.stdout.write(self.style.ERROR('No current fiscal year found. Run seed_master_data first.'))
            return

        dept = Department.objects.filter(level='national').first()
        if not dept:
            self.stdout.write(self.style.ERROR('No national department found. Run seed_master_data first.'))
            return

        app, created = AnnualProcurementPlan.objects.get_or_create(
            fiscal_year=fy,
            department=dept,
            defaults={'status': 'draft'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created APP for {fy.year_code} - {dept.dept_name}'))
        else:
            self.stdout.write(self.style.WARNING('APP already exists'))

        if created:
            for commodity in Commodity.objects.all()[:5]:
                APPLineItem.objects.create(
                    app=app,
                    description=f'Procurement of {commodity.commodity_name}',
                    estimated_value=100000,
                    recommended_method='open_tender',
                    planned_issue_date='2026-06-01',
                    planned_award_date='2026-09-30',
                )
            self.stdout.write(self.style.SUCCESS('Added 5 line items to APP'))
