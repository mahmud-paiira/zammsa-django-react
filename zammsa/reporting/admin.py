from django.contrib import admin
from .models import ProcurementWarehouse, DemandForecast, ArchivedProcurementFile, ReportDefinition, ReportGeneration, ZPPASubmission

admin.site.register(ProcurementWarehouse)
admin.site.register(DemandForecast)
admin.site.register(ArchivedProcurementFile)
admin.site.register(ReportDefinition)
admin.site.register(ReportGeneration)


@admin.register(ZPPASubmission)
class ZPPASubmissionAdmin(admin.ModelAdmin):
    list_display = ('report', 'status', 'submitted_at', 'zppa_reference')
    list_filter = ('status',)
    search_fields = ('report__report_name', 'zppa_reference')
