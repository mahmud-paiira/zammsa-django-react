from rest_framework_simplejwt.authentication import JWTAuthentication as BaseJWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.utils import timezone
from .models import User


class JWTAuthentication(BaseJWTAuthentication):
    def authenticate(self, request):
        response = super().authenticate(request)
        if response is not None:
            user, validated_token = response
            if user.is_locked():
                raise AuthenticationFailed('Account is locked due to too many failed attempts. Try again later.')
            if not user.is_active:
                raise AuthenticationFailed('Account is inactive.')
            user.last_login_ip = self.get_client_ip(request)
            user.save(update_fields=['last_login_ip'])
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
