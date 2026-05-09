from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.utils import timezone
from .models import User, LoginAttempt, AuditLog, PasswordHistory


@receiver(pre_save, sender=User)
def track_user_changes(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = User.objects.get(pk=instance.pk)
            changes = {}
            for field in ('full_name', 'email', 'role', 'is_active', 'is_staff', 'is_superuser'):
                old_val = getattr(old, field)
                new_val = getattr(instance, field)
                if old_val != new_val:
                    changes[field] = {'old': str(old_val), 'new': str(new_val)}
            if changes:
                AuditLog.objects.create(
                    user=instance,
                    action='update',
                    module='users',
                    record_id=str(instance.pk),
                    old_value=changes,
                )
        except User.DoesNotExist:
            pass


@receiver(post_save, sender=User)
def log_user_creation(sender, instance, created, **kwargs):
    if created:
        AuditLog.objects.create(
            user=instance,
            action='create',
            module='users',
            record_id=str(instance.pk),
            new_value={'email': instance.email, 'full_name': instance.full_name, 'role': instance.role},
        )


@receiver(user_logged_in)
def log_successful_login(sender, request, user, **kwargs):
    LoginAttempt.objects.create(
        username=user.email,
        ip_address=request.META.get('REMOTE_ADDR'),
        was_successful=True,
    )
    user.last_login = timezone.now()
    user.last_login_ip = request.META.get('REMOTE_ADDR')
    user.reset_failed_attempts()


@receiver(user_login_failed)
def log_failed_login(sender, credentials, request, **kwargs):
    username = credentials.get('email', 'unknown')
    LoginAttempt.objects.create(
        username=username,
        ip_address=request.META.get('REMOTE_ADDR') if request else None,
        was_successful=False,
    )


@receiver(post_save, sender=PasswordHistory)
def log_password_change(sender, instance, created, **kwargs):
    if created:
        AuditLog.objects.create(
            user=instance.user,
            action='password_change',
            module='auth',
            record_id=str(instance.user.pk),
        )
