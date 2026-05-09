import uuid
from django.db import models
from django.core.exceptions import ValidationError


class SystemSetting(models.Model):
    setting_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    setting_key = models.CharField(max_length=100, unique=True)
    setting_value = models.JSONField()
    data_type = models.CharField(max_length=50, default='string')
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    is_encrypted = models.BooleanField(default=False)

    class Meta:
        db_table = 'config_system_setting'
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'
        ordering = ['category', 'setting_key']

    def __str__(self):
        return self.setting_key


class NotificationTemplate(models.Model):
    template_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template_key = models.CharField(max_length=100, unique=True)
    subject_template = models.CharField(max_length=255)
    body_template = models.TextField(help_text='HTML body template')
    placeholders = models.JSONField(default=list, help_text='List of placeholder keys')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'config_notification_template'
        verbose_name = 'Notification Template'
        verbose_name_plural = 'Notification Templates'
        ordering = ['template_key']

    def __str__(self):
        return self.template_key


class ThresholdRule(models.Model):
    rule_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rule_key = models.CharField(max_length=100, unique=True)
    rule_name = models.CharField(max_length=255)
    min_value = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    max_value = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default='ZMW')
    applies_to = models.CharField(max_length=100, help_text='Entity type this rule applies to')
    default_method = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'config_threshold_rule'
        verbose_name = 'Threshold Rule'
        verbose_name_plural = 'Threshold Rules'
        ordering = ['min_value']

    def __str__(self):
        return f'{self.rule_name} ({self.min_value} - {self.max_value or "∞"} {self.currency})'


class PreferenceRule(models.Model):
    preference_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    preference_key = models.CharField(max_length=100, unique=True)
    preference_name = models.CharField(max_length=255)
    value = models.JSONField()
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=True)

    class Meta:
        db_table = 'config_preference_rule'
        verbose_name = 'Preference Rule'
        verbose_name_plural = 'Preference Rules'
        ordering = ['preference_key']

    def clean(self):
        if self.effective_to and self.effective_from > self.effective_to:
            raise ValidationError('Effective from must be before effective to')

    def __str__(self):
        return self.preference_name


class WorkflowStage(models.Model):
    stage_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_name = models.CharField(max_length=100)
    stage_order = models.IntegerField()
    stage_name = models.CharField(max_length=255)
    stage_code = models.CharField(max_length=50)
    allowed_actions = models.JSONField(default=list)
    allowed_roles = models.JSONField(default=list)
    time_limit_hours = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'config_workflow_stage'
        verbose_name = 'Workflow Stage'
        verbose_name_plural = 'Workflow Stages'
        ordering = ['workflow_name', 'stage_order']
        unique_together = ('workflow_name', 'stage_order')

    def __str__(self):
        return f'{self.workflow_name}: {self.stage_name}'


class ScheduledTask(models.Model):
    task_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task_name = models.CharField(max_length=255)
    task_type = models.CharField(max_length=100)
    schedule_cron = models.CharField(max_length=100, blank=True)
    parameters = models.JSONField(default=dict, blank=True)
    is_enabled = models.BooleanField(default=True)
    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField(null=True, blank=True)
    last_status = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'config_scheduled_task'
        verbose_name = 'Scheduled Task'
        verbose_name_plural = 'Scheduled Tasks'
        ordering = ['task_name']

    def __str__(self):
        return self.task_name


class IntegrationEndpoint(models.Model):
    endpoint_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    system_name = models.CharField(max_length=255)
    endpoint_url = models.URLField(max_length=500)
    auth_type = models.CharField(max_length=50, default='api_key')
    auth_config = models.JSONField(default=dict, help_text='Encrypted authentication configuration')
    timeout_seconds = models.IntegerField(default=30)
    retry_count = models.IntegerField(default=3)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = 'config_integration_endpoint'
        verbose_name = 'Integration Endpoint'
        verbose_name_plural = 'Integration Endpoints'
        ordering = ['system_name']

    def __str__(self):
        return f'{self.system_name} ({self.endpoint_url})'
