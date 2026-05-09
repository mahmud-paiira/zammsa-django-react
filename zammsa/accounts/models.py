import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from .managers import UserManager

ROLE_CHOICES = [
    ('system_admin', 'System Administrator'),
    ('director_procurement', 'Director of Procurement'),
    ('director_general', 'Director General'),
    ('zpc_member', 'ZPC Member'),
    ('procurement_officer', 'Procurement Officer'),
    ('procurement_manager', 'Procurement Manager'),
    ('finance_officer', 'Finance Officer'),
    ('budget_controller', 'Budget Controller'),
    ('department_head', 'Department Head'),
    ('user_dept_staff', 'User Department Staff'),
    ('evaluation_committee_member', 'Evaluation Committee Member'),
    ('evaluation_committee_chair', 'Evaluation Committee Chair'),
    ('contract_manager', 'Contract Manager'),
    ('supplier_relationship_manager', 'Supplier Relationship Manager'),
    ('supplier_user', 'Supplier User'),
    ('auditor', 'Auditor'),
    ('zppa_reporting_officer', 'ZPPA Reporting Officer'),
    ('integration_manager', 'Integration Manager'),
    ('public_portal_viewer', 'Public Portal Viewer'),
]


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee_id = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    department = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='user_dept_staff')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=64, blank=True)
    mfa_enabled = models.BooleanField(default=False)
    password_changed_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    must_change_password = models.BooleanField(default=False)
    temp_password = models.CharField(max_length=255, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'employee_id']

    class Meta:
        db_table = 'accounts_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} ({self.email})'

    def is_locked(self):
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

    def increment_failed_attempts(self):
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.locked_until = timezone.now() + timezone.timedelta(minutes=30)
        self.save(update_fields=['failed_login_attempts', 'locked_until'])

    def reset_failed_attempts(self):
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save(update_fields=['failed_login_attempts', 'locked_until'])


class Role(models.Model):
    role_name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
    description = models.TextField(blank=True)
    hierarchy_level = models.IntegerField(default=0)

    class Meta:
        db_table = 'accounts_role'
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
        ordering = ['hierarchy_level']

    def __str__(self):
        return f'{self.get_role_name_display()}'


class Permission(models.Model):
    module = models.CharField(max_length=100)
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=100)

    class Meta:
        db_table = 'accounts_permission'
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'
        unique_together = ('module', 'action', 'resource_type')

    def __str__(self):
        return f'{self.module}:{self.action}:{self.resource_type}'


class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    effective_from = models.DateTimeField(default=timezone.now)
    effective_to = models.DateTimeField(null=True, blank=True)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='granted_roles')

    class Meta:
        db_table = 'accounts_user_role'
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
        unique_together = ('user', 'role', 'effective_from')

    def __str__(self):
        return f'{self.user.email} - {self.role.role_name}'


class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='role_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        db_table = 'accounts_role_permission'
        verbose_name = 'Role Permission'
        verbose_name_plural = 'Role Permissions'
        unique_together = ('role', 'permission')

    def __str__(self):
        return f'{self.role.role_name} - {self.permission}'


class ImmutableModel(models.Model):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if self.pk:
            raise PermissionDenied('Audit logs cannot be modified')
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise PermissionDenied('Audit logs cannot be deleted')


class AuditLog(ImmutableModel):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)
    module = models.CharField(max_length=100)
    record_id = models.CharField(max_length=255, blank=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts_audit_log'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'module']),
        ]

    def __str__(self):
        return f'{self.action} on {self.module} by {self.user} at {self.timestamp}'


class LoginAttempt(models.Model):
    username = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    was_successful = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts_login_attempt'
        verbose_name = 'Login Attempt'
        verbose_name_plural = 'Login Attempts'
        ordering = ['-timestamp']

    def __str__(self):
        result = 'success' if self.was_successful else 'failed'
        return f'{self.username} - {result} at {self.timestamp}'


class PasswordHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_histories')
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts_password_history'
        verbose_name = 'Password History'
        verbose_name_plural = 'Password Histories'
        ordering = ['-created_at']

    def __str__(self):
        return f'Password change for {self.user.email} at {self.created_at}'


class MFACode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mfa_codes')
    code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'accounts_mfa_code'
        verbose_name = 'MFA Code'
        verbose_name_plural = 'MFA Codes'
        ordering = ['-created_at']

    def __str__(self):
        return f'MFA for {self.user.email} - {"used" if self.is_used else "pending"}'

    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()


class ConflictOfInterest(models.Model):
    DECLARATION_CHOICES = [
        ('personal', 'Personal Relationship'),
        ('financial', 'Financial Interest'),
        ('relational', 'Relational Conflict'),
        ('organizational', 'Organizational Conflict'),
        ('other', 'Other'),
    ]
    RESOLUTION_CHOICES = [
        ('recused', 'Recused from Evaluation'),
        ('allowed', 'Allowed to Participate'),
        ('pending', 'Pending Review'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conflict_declarations')
    procurement_id = models.CharField(max_length=255)
    declaration_type = models.CharField(max_length=50, choices=DECLARATION_CHOICES)
    declared_conflict = models.TextField()
    resolution = models.CharField(max_length=50, choices=RESOLUTION_CHOICES, default='pending')
    declared_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='conflict_resolutions')

    class Meta:
        db_table = 'accounts_conflict_of_interest'
        verbose_name = 'Conflict of Interest'
        verbose_name_plural = 'Conflicts of Interest'
        ordering = ['-declared_at']

    def __str__(self):
        return f'{self.user.full_name} - {self.declaration_type} on {self.procurement_id}'
