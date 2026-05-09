from django.contrib import admin
from .models import BudgetAllocation, BudgetEncumbrance, Invoice, ThreeWayMatch, Payment, LetterOfCredit

admin.site.register(BudgetAllocation)
admin.site.register(BudgetEncumbrance)
admin.site.register(Invoice)
admin.site.register(ThreeWayMatch)
admin.site.register(Payment)
admin.site.register(LetterOfCredit)
