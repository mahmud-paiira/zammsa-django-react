from django.contrib import admin
from .models import Requisition, RequisitionItem, Specification, RequisitionApproval, RequisitionVersion, BudgetEncumbrance

admin.site.register(Requisition)
admin.site.register(RequisitionItem)
admin.site.register(Specification)
admin.site.register(RequisitionApproval)
admin.site.register(RequisitionVersion)
admin.site.register(BudgetEncumbrance)
