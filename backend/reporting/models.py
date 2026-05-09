import uuid
from django.db import models
from django.utils import timezone
from accounts.models import User


ZPPA_SUBMISSION_STATUSES = (
    ('draft', 'Draft'),
    ('ready', 'Ready for Submission'),
    ('submitted', 'Submitted to ZPPA'),
    ('acknowledged', 'Acknowledged by ZPPA'),
    ('rejected', 'Rejected by ZPPA'),
)

ARCHIVE_RETENTION_YEARS = 7


class ProcurementWarehouse(models.Model):
    fact_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    procurement_id = models.CharField(max_length=100, unique=True)
    value = models.DecimalField(max_digits=20, decimal_places=2)
    method = models.CharField(max_length=50)
    award_date = models.DateField(null=True, blank=True)
    supplier_category = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=50)
    processing_days = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'rpt_warehouse'
        verbose_name = 'Procurement Warehouse'
        verbose_name_plural = 'Procurement Warehouse'
        ordering = ['-award_date']

    def __str__(self):
        return f'Fact {self.procurement_id}'


class DemandForecast(models.Model):
    forecast_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item_code = models.CharField(max_length=50)
    forecast_period = models.CharField(max_length=20)
    forecasted_quantity = models.DecimalField(max_digits=15, decimal_places=2)
    upper_bound = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    lower_bound = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    actual_quantity = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    accuracy = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'rpt_demand_forecast'
        verbose_name = 'Demand Forecast'
        verbose_name_plural = 'Demand Forecasts'
        unique_together = ('item_code', 'forecast_period')

    def __str__(self):
        return f'{self.item_code} - {self.forecast_period}'


class ArchivedProcurementFile(models.Model):
    archive_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    procurement_id = models.CharField(max_length=100)
    file_path = models.CharField(max_length=500)
    encryption_key_ref = models.CharField(max_length=200, blank=True)
    size_bytes = models.BigIntegerField(default=0)
    archived_at = models.DateTimeField(auto_now_add=True)
    retention_expiry = models.DateField()
    legal_hold = models.BooleanField(default=False)

    class Meta:
        db_table = 'rpt_archive'
        verbose_name = 'Archived Procurement File'
        verbose_name_plural = 'Archived Procurement Files'
        ordering = ['-archived_at']

    def save(self, *args, **kwargs):
        if not self.retention_expiry:
            self.retention_expiry = (timezone.now() + timezone.timedelta(days=ARCHIVE_RETENTION_YEARS * 365)).date()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Archive {self.procurement_id}'

    @property
    def days_to_expiry(self):
        return (self.retention_expiry - timezone.now().date()).days if not self.legal_hold else None


class ReportDefinition(models.Model):
    report_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50)
    schedule = models.CharField(max_length=100, blank=True)
    format = models.CharField(max_length=50, blank=True)
    recipient_list = models.JSONField(default=list)

    class Meta:
        db_table = 'rpt_definition'
        verbose_name = 'Report Definition'
        verbose_name_plural = 'Report Definitions'

    def __str__(self):
        return self.report_name


class ReportGeneration(models.Model):
    generation_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(ReportDefinition, on_delete=models.CASCADE, related_name='generations')
    generated_at = models.DateTimeField(auto_now_add=True)
    file_path = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, default='pending')

    class Meta:
        db_table = 'rpt_generation'
        verbose_name = 'Report Generation'
        verbose_name_plural = 'Report Generations'
        ordering = ['-generated_at']

    def __str__(self):
        return f'{self.report.report_name} at {self.generated_at}'


class ZPPASubmission(models.Model):
    submission_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(ReportDefinition, on_delete=models.CASCADE, related_name='zppa_submissions')
    generation = models.ForeignKey(ReportGeneration, on_delete=models.SET_NULL, null=True, blank=True, related_name='zppa_submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=ZPPA_SUBMISSION_STATUSES, default='draft')
    response_message = models.TextField(blank=True)
    zppa_reference = models.CharField(max_length=100, blank=True)
    submission_data = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'rpt_zppa_submission'
        verbose_name = 'ZPPA Submission'
        verbose_name_plural = 'ZPPA Submissions'
        ordering = ['-submitted_at']

    def __str__(self):
        return f'ZPPA {self.status} - {self.report.report_name} ({self.submitted_at.date()})'
