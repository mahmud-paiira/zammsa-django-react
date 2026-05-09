from rest_framework import serializers
from .models import SystemSetting, NotificationTemplate, ThresholdRule, PreferenceRule, WorkflowStage, ScheduledTask, IntegrationEndpoint


class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'


class ThresholdRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThresholdRule
        fields = '__all__'


class PreferenceRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreferenceRule
        fields = '__all__'


class WorkflowStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStage
        fields = '__all__'


class ScheduledTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledTask
        fields = '__all__'
        read_only_fields = ('last_run', 'next_run', 'last_status')


class IntegrationEndpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationEndpoint
        fields = '__all__'
