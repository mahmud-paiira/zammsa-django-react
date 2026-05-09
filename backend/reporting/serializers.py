from rest_framework import serializers
from .models import ProcurementWarehouse, DemandForecast, ArchivedProcurementFile, ReportDefinition, ReportGeneration, ZPPASubmission


class ProcurementWarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcurementWarehouse
        fields = '__all__'


class DemandForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemandForecast
        fields = '__all__'


class ArchivedProcurementFileSerializer(serializers.ModelSerializer):
    days_to_expiry = serializers.IntegerField(read_only=True)

    class Meta:
        model = ArchivedProcurementFile
        fields = '__all__'
        read_only_fields = ('archive_id', 'archived_at')


class ReportDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportDefinition
        fields = '__all__'


class ReportGenerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportGeneration
        fields = '__all__'
        read_only_fields = ('generation_id', 'generated_at')


class ZPPASubmissionSerializer(serializers.ModelSerializer):
    report_name = serializers.CharField(source='report.report_name', read_only=True)

    class Meta:
        model = ZPPASubmission
        fields = '__all__'
        read_only_fields = ('submission_id', 'submitted_at', 'response_message', 'zppa_reference')
