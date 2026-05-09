from django.contrib import admin
from .models import AnnualProcurementPlan, APPLineItem, ContractProcurementPlan, ProcurementMilestone, GeneralProcurementNotice

admin.site.register(AnnualProcurementPlan)
admin.site.register(APPLineItem)
admin.site.register(ContractProcurementPlan)
admin.site.register(ProcurementMilestone)
admin.site.register(GeneralProcurementNotice)
