import uuid
from django.db import models
from django.utils import timezone

WEBHOOK_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('processing', 'Processing'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
]


class IntegrationEndpoint(models.Model):
    endpoint_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    system_name = models.CharField(max_length=255)
    endpoint_url = models.URLField(max_length=500)
    auth_type = models.CharField(max_length=50, default='api_key')
    auth_config = models.JSONField(default=dict, help_text='Encrypted auth configuration')
    timeout_seconds = models.IntegerField(default=30)
    retry_count = models.IntegerField(default=5)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = 'int_endpoint'
        verbose_name = 'Integration Endpoint'
        verbose_name_plural = 'Integration Endpoints'
        ordering = ['system_name']

    def __str__(self):
        return f'{self.system_name} ({self.endpoint_url})'


class IntegrationLog(models.Model):
    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    endpoint = models.ForeignKey(IntegrationEndpoint, on_delete=models.CASCADE, related_name='logs')
    request_method = models.CharField(max_length=10)
    request_url = models.CharField(max_length=500)
    response_status = models.IntegerField(null=True, blank=True)
    response_time_ms = models.IntegerField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'int_log'
        verbose_name = 'Integration Log'
        verbose_name_plural = 'Integration Logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.request_method} {self.request_url} - {self.response_status}'


class SyncStatus(models.Model):
    sync_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_type = models.CharField(max_length=100)
    last_sync_time = models.DateTimeField()
    sync_status = models.CharField(max_length=20, default='pending')
    records_processed = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'int_sync_status'
        verbose_name = 'Sync Status'
        verbose_name_plural = 'Sync Statuses'
        unique_together = ('entity_type', 'last_sync_time')

    def __str__(self):
        return f'{self.entity_type} - {self.last_sync_time}'


class WebhookDelivery(models.Model):
    webhook_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_system = models.CharField(max_length=255)
    payload_hash = models.CharField(max_length=128)
    received_at = models.DateTimeField(auto_now_add=True)
    processed_status = models.CharField(max_length=20, choices=WEBHOOK_STATUS_CHOICES, default='pending')

    class Meta:
        db_table = 'int_webhook'
        verbose_name = 'Webhook Delivery'
        verbose_name_plural = 'Webhook Deliveries'
        ordering = ['-received_at']

    def __str__(self):
        return f'{self.source_system} - {self.payload_hash[:16]}'
