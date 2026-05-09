from django.contrib import admin
from .models import Contract, ContractSecurity, ContractAmendment, ContractMilestone, LiquidatedDamages, ContractTermination

admin.site.register(Contract)
admin.site.register(ContractSecurity)
admin.site.register(ContractAmendment)
admin.site.register(ContractMilestone)
admin.site.register(LiquidatedDamages)
admin.site.register(ContractTermination)
