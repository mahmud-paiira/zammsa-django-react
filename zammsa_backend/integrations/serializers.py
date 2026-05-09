from rest_framework import serializers
from .models import IntegrationEndpoint, IntegrationLog, SyncStatus, WebhookDelivery


class IntegrationEndpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationEndpoint
        fields = '__all__'


class IntegrationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationLog
        fields = '__all__'
        read_only_fields = ('log_id', 'timestamp')


class SyncStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncStatus
        fields = '__all__'


class WebhookDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookDelivery
        fields = '__all__'
        read_only_fields = ('webhook_id', 'received_at')
