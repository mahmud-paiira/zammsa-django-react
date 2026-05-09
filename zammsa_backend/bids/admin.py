from django.contrib import admin
from .models import BidSubmission, BidDocument, BidSecurity, BidOpening, BidOpeningDetail, PreBidConference

admin.site.register(BidSubmission)
admin.site.register(BidDocument)
admin.site.register(BidSecurity)
admin.site.register(BidOpening)
admin.site.register(BidOpeningDetail)
admin.site.register(PreBidConference)
