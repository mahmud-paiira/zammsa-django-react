from django.contrib import admin
from .models import NewsArticle, Notice, Event, FAQItem, ContactMessage


@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_published', 'published_at', 'view_count')
    list_filter = ('is_published', 'category', 'is_featured')
    search_fields = ('title', 'summary', 'content')
    prepopulated_fields = {'slug': ('title',)}
    actions = ['publish_articles', 'unpublish_articles']

    def publish_articles(self, request, queryset):
        from django.utils import timezone
        queryset.update(is_published=True, published_at=timezone.now())
    publish_articles.short_description = 'Publish selected articles'

    def unpublish_articles(self, request, queryset):
        queryset.update(is_published=False)
    unpublish_articles.short_description = 'Unpublish selected articles'


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'notice_type', 'is_pinned', 'is_published', 'published_at')
    list_filter = ('is_published', 'notice_type', 'is_pinned')
    search_fields = ('title', 'content')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'start_date', 'end_date', 'is_featured')
    list_filter = ('is_published', 'event_type', 'is_featured')
    search_fields = ('title', 'location')


@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'order', 'is_published')
    list_filter = ('is_published', 'category')
    search_fields = ('question', 'answer')
    ordering = ('order',)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('name', 'email', 'subject', 'message', 'created_at')
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = 'Mark selected messages as read'
