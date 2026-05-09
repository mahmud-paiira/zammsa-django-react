from django.contrib import admin
from .models import IntegrationEndpoint, IntegrationLog, SyncStatus, WebhookDelivery

admin.site.register(IntegrationEndpoint)
admin.site.register(IntegrationLog)
admin.site.register(SyncStatus)
admin.site.register(WebhookDelivery)
