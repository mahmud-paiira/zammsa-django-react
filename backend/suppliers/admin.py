from django.contrib import admin
from .models import Supplier, VendorApplication, VendorApplicationDocument, SupplierDocument, SupplierPerformance, SupplierRiskScore, Blacklist

admin.site.register(Supplier)
admin.site.register(VendorApplication)
admin.site.register(VendorApplicationDocument)
admin.site.register(SupplierDocument)
admin.site.register(SupplierPerformance)
admin.site.register(SupplierRiskScore)
admin.site.register(Blacklist)
