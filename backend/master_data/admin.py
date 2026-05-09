from django.contrib import admin
from .models import Department, FiscalYear, Commodity, UnitOfMeasure, FundingSource, DocumentTemplate, RiskLibrary, ApprovalMatrix, ChangeRequest

admin.site.register(Department)
admin.site.register(FiscalYear)
admin.site.register(Commodity)
admin.site.register(UnitOfMeasure)
admin.site.register(FundingSource)
admin.site.register(DocumentTemplate)
admin.site.register(RiskLibrary)
admin.site.register(ApprovalMatrix)
admin.site.register(ChangeRequest)
