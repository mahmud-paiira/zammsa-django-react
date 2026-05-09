from django.contrib import admin
from .models import SystemSetting, NotificationTemplate, ThresholdRule, PreferenceRule, WorkflowStage, ScheduledTask, IntegrationEndpoint

admin.site.register(SystemSetting)
admin.site.register(NotificationTemplate)
admin.site.register(ThresholdRule)
admin.site.register(PreferenceRule)
admin.site.register(WorkflowStage)
admin.site.register(ScheduledTask)
admin.site.register(IntegrationEndpoint)
