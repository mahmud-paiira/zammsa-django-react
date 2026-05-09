from django.contrib import admin
from .models import ProcurementMethodType, MethodRecommendation, MethodOverride, NonOpenJustification, PreferenceScheme

admin.site.register(ProcurementMethodType)
admin.site.register(MethodRecommendation)
admin.site.register(MethodOverride)
admin.site.register(NonOpenJustification)
admin.site.register(PreferenceScheme)
