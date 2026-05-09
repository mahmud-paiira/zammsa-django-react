from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Role, Permission, UserRole, RolePermission, AuditLog, LoginAttempt, PasswordHistory, MFACode, ConflictOfInterest


class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'employee_id', 'role', 'is_active', 'last_login')
    list_filter = ('role', 'is_active', 'is_staff', 'department')
    search_fields = ('email', 'full_name', 'employee_id')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'employee_id', 'phone', 'department')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Security', {'fields': ('mfa_enabled', 'mfa_secret', 'failed_login_attempts', 'locked_until')}),
        ('Important Dates', {'fields': ('last_login', 'password_changed_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'employee_id', 'password1', 'password2', 'role', 'is_active'),
        }),
    )
    readonly_fields = ('failed_login_attempts', 'locked_until', 'last_login', 'password_changed_at')


admin.site.register(User, UserAdmin)
admin.site.register(Role)
admin.site.register(Permission)
admin.site.register(UserRole)
admin.site.register(RolePermission)
admin.site.register(AuditLog)
admin.site.register(LoginAttempt)
admin.site.register(PasswordHistory)
admin.site.register(MFACode)
admin.site.register(ConflictOfInterest)
