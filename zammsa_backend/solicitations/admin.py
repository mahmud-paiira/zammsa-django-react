from django.contrib import admin
from .models import SolicitationTemplate, Solicitation, EvaluationCriterion, SolicitationAddendum, ClarificationRequest, SolicitationDocument

admin.site.register(SolicitationTemplate)
admin.site.register(Solicitation)
admin.site.register(EvaluationCriterion)
admin.site.register(SolicitationAddendum)
admin.site.register(ClarificationRequest)
admin.site.register(SolicitationDocument)
