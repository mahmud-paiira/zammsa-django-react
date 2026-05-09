from django.urls import path, include
from . import views

urlpatterns = [
    path('auth/login/', views.login_view, name='auth-login'),
    path('auth/mfa-login/', views.mfa_login_view, name='auth-mfa-login'),
    path('auth/logout/', views.logout_view, name='auth-logout'),
    path('auth/change-password/', views.change_password_view, name='auth-change-password'),
    path('auth/forgot-password/', views.forgot_password_view, name='auth-forgot-password'),
    path('auth/reset-password/', views.reset_password_view, name='auth-reset-password'),
    path('auth/mfa/setup/', views.mfa_setup_view, name='auth-mfa-setup'),
    path('auth/mfa/verify/', views.mfa_verify_view, name='auth-mfa-verify'),
    path('auth/me/', views.me_view, name='auth-me'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/create/', views.UserCreateView.as_view(), name='user-create'),
    path('users/export/', views.export_users_view, name='user-export'),
    path('users/<uuid:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('audit-logs/', views.AuditLogListView.as_view(), name='audit-log-list'),
    path('conflicts/', views.ConflictOfInterestListCreateView.as_view(), name='conflict-list-create'),
    path('conflicts/<int:pk>/', views.ConflictOfInterestDetailView.as_view(), name='conflict-detail'),
    path('admin/', include('accounts.admin_urls')),
]
