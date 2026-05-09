from django.contrib import admin
from .models import EvaluationCommittee, PreliminaryExam, TechnicalScore, FinancialEvaluation, CombinedScore, BidEvaluationReport, PostQualification

admin.site.register(EvaluationCommittee)
admin.site.register(PreliminaryExam)
admin.site.register(TechnicalScore)
admin.site.register(FinancialEvaluation)
admin.site.register(CombinedScore)
admin.site.register(BidEvaluationReport)
admin.site.register(PostQualification)
