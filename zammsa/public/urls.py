from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.public_stats, name='public-stats'),
    path('tenders/', views.TenderList.as_view(), name='public-tender-list'),
    path('tenders/<uuid:pk>/', views.TenderDetail.as_view(), name='public-tender-detail'),
    path('tenders/<uuid:pk>/track-view/', views.track_tender_view, name='public-tender-track-view'),
    path('tenders/<uuid:tender_id>/documents/<uuid:document_id>/download/', views.TenderDocumentDownload.as_view(), name='public-tender-document-download'),
    path('news/', views.NewsList.as_view(), name='public-news-list'),
    path('news/<uuid:pk>/', views.NewsDetail.as_view(), name='public-news-detail'),
    path('news/<uuid:pk>/track-view/', views.track_news_view, name='public-news-track-view'),
    path('notices/', views.NoticeList.as_view(), name='public-notice-list'),
    path('notices/<uuid:pk>/', views.NoticeDetail.as_view(), name='public-notice-detail'),
    path('notices/<uuid:pk>/track-view/', views.track_notice_view, name='public-notice-track-view'),
    path('events/', views.EventList.as_view(), name='public-event-list'),
    path('faqs/', views.FAQList.as_view(), name='public-faq-list'),
    path('contact/', views.ContactCreate.as_view(), name='public-contact'),
]
