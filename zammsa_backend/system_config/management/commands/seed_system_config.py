from django.core.management.base import BaseCommand
from system_config.models import ThresholdRule, PreferenceRule, SystemSetting, NotificationTemplate

THRESHOLDS = [
    {'key': 'DG_APPROVAL', 'name': 'Director General Approval Threshold', 'min': 0, 'max': 250000, 'applies': 'procurement', 'method': 'single_source'},
    {'key': 'ZPC_APPROVAL', 'name': 'ZPC Approval Threshold', 'min': 250000, 'max': 1000000, 'applies': 'procurement', 'method': 'restricted'},
    {'key': 'OPEN_TENDER', 'name': 'Open Tender Threshold', 'min': 1000000, 'max': None, 'applies': 'procurement', 'method': 'open_tender'},
    {'key': 'EC_APPOINTMENT', 'name': 'Evaluation Committee Appointment', 'min': 500000, 'max': None, 'applies': 'evaluation', 'method': 'committee'},
    {'key': 'CONTRACT_EXTENSION', 'name': 'Contract Extension Limit', 'min': 0, 'max': 50000, 'applies': 'contract', 'method': 'direct'},
]

PREFERENCES = [
    {'key': 'LOCAL_PREF_MARGIN', 'name': 'Local Supplier Preference Margin', 'val': {'margin': 4, 'type': 'percentage', 'description': '4% margin for local suppliers'}, 'current': True},
    {'key': 'CITIZEN_PREF_MARGIN', 'name': 'Citizen-Owned Preference Margin', 'val': {'margin': 8, 'type': 'percentage', 'description': '8% margin for citizen-owned enterprises'}, 'current': True},
    {'key': 'SME_PREF_MARGIN', 'name': 'SME Preference Margin', 'val': {'margin': 12, 'type': 'percentage', 'description': '12% margin for small and medium enterprises'}, 'current': True},
    {'key': 'BID_PREF_MARGIN', 'name': 'Bidder Preference Margin', 'val': {'margin': 15, 'type': 'percentage', 'description': '15% margin for preferential bidders'}, 'current': True},
    {'key': 'WOMEN_OWNED_PREF', 'name': 'Women-Owned Business Preference', 'val': {'margin': 10, 'type': 'percentage', 'description': '10% margin for women-owned businesses'}, 'current': True},
    {'key': 'YOUTH_OWNED_PREF', 'name': 'Youth-Owned Business Preference', 'val': {'margin': 10, 'type': 'percentage', 'description': '10% margin for youth-owned businesses'}, 'current': True},
]

SETTINGS = [
    {'key': 'SITE_NAME', 'val': 'ZAMMSA Procurement System', 'type': 'string', 'cat': 'general', 'desc': 'System display name'},
    {'key': 'SITE_DESCRIPTION', 'val': 'Zambia Medicines and Medical Supplies Agency - Electronic Procurement System', 'type': 'string', 'cat': 'general', 'desc': 'System description'},
    {'key': 'MAX_LOGIN_ATTEMPTS', 'val': 5, 'type': 'integer', 'cat': 'security', 'desc': 'Maximum failed login attempts before lockout'},
    {'key': 'LOCKOUT_DURATION_MINUTES', 'val': 30, 'type': 'integer', 'cat': 'security', 'desc': 'Account lockout duration in minutes'},
    {'key': 'PASSWORD_MIN_LENGTH', 'val': 8, 'type': 'integer', 'cat': 'security', 'desc': 'Minimum password length'},
    {'key': 'SESSION_TIMEOUT_MINUTES', 'val': 60, 'type': 'integer', 'cat': 'security', 'desc': 'Session timeout in minutes'},
    {'key': 'TENDER_OPENING_DAYS', 'val': 30, 'type': 'integer', 'cat': 'procurement', 'desc': 'Default tender opening period in days'},
    {'key': 'BID_VALIDITY_DAYS', 'val': 90, 'type': 'integer', 'cat': 'procurement', 'desc': 'Bid validity period in days'},
    {'key': 'CONTRACT_MAX_TERM_YEARS', 'val': 3, 'type': 'integer', 'cat': 'contract', 'desc': 'Maximum contract term in years'},
    {'key': 'CURRENCY', 'val': 'ZMW', 'type': 'string', 'cat': 'general', 'desc': 'Default currency'},
    {'key': 'TAX_RATE', 'val': 16, 'type': 'decimal', 'cat': 'finance', 'desc': 'Standard VAT rate percentage'},
    {'key': 'REQUISITION_AUTO_APPROVE', 'val': False, 'type': 'boolean', 'cat': 'procurement', 'desc': 'Auto-approve requisitions under threshold'},
]

NOTIFICATIONS = [
    {
        'key': 'WELCOME_EMAIL',
        'subject': 'Welcome to ZAMMSA Procurement System',
        'body': '<h1>Welcome {{full_name}}</h1><p>Your account has been created. Your temporary password is: <strong>{{temp_password}}</strong></p><p>Please login at {{login_url}} and change your password.</p>',
        'placeholders': ['full_name', 'temp_password', 'login_url'],
    },
    {
        'key': 'PASSWORD_RESET',
        'subject': 'Password Reset Request',
        'body': '<h1>Password Reset</h1><p>Your password reset code is: <strong>{{reset_code}}</strong></p><p>This code expires in 15 minutes.</p>',
        'placeholders': ['reset_code'],
    },
    {
        'key': 'MFA_CODE',
        'subject': 'Your MFA Verification Code',
        'body': '<h1>MFA Verification</h1><p>Your verification code is: <strong>{{mfa_code}}</strong></p><p>This code expires in 5 minutes.</p>',
        'placeholders': ['mfa_code'],
    },
    {
        'key': 'CHANGE_REQUEST_APPROVED',
        'subject': 'Change Request Approved',
        'body': '<h1>Change Request Approved</h1><p>Your change request for {{entity_type}} ({{entity_id}}) has been approved.</p>',
        'placeholders': ['entity_type', 'entity_id'],
    },
]


class Command(BaseCommand):
    help = 'Seed system configuration: thresholds, preferences, settings, notifications'

    def handle(self, *args, **options):
        from datetime import date

        for t in THRESHOLDS:
            ThresholdRule.objects.get_or_create(
                rule_key=t['key'],
                defaults={
                    'rule_name': t['name'],
                    'min_value': t['min'],
                    'max_value': t['max'],
                    'applies_to': t['applies'],
                    'default_method': t['method'],
                }
            )
        self.stdout.write(f'Created {len(THRESHOLDS)} threshold rules')

        for p in PREFERENCES:
            PreferenceRule.objects.get_or_create(
                preference_key=p['key'],
                defaults={
                    'preference_name': p['name'],
                    'value': p['val'],
                    'effective_from': date(2026, 1, 1),
                    'is_current': p['current'],
                }
            )
        self.stdout.write(f'Created {len(PREFERENCES)} preference rules')

        for s in SETTINGS:
            SystemSetting.objects.get_or_create(
                setting_key=s['key'],
                defaults={
                    'setting_value': s['val'],
                    'data_type': s['type'],
                    'category': s['cat'],
                    'description': s['desc'],
                }
            )
        self.stdout.write(f'Created {len(SETTINGS)} system settings')

        for n in NOTIFICATIONS:
            NotificationTemplate.objects.get_or_create(
                template_key=n['key'],
                defaults={
                    'subject_template': n['subject'],
                    'body_template': n['body'],
                    'placeholders': n['placeholders'],
                }
            )
        self.stdout.write(f'Created {len(NOTIFICATIONS)} notification templates')

        self.stdout.write(self.style.SUCCESS('System configuration seeded successfully'))
