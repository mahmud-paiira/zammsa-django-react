import uuid
from django.db import models
from django.utils import timezone


class NewsArticle(models.Model):
    news_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    summary = models.TextField()
    content = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    featured_image = models.ImageField(upload_to='news/', blank=True)
    author = models.CharField(max_length=255, blank=True)
    is_featured = models.BooleanField(default=False)
    tags = models.JSONField(default=list, blank=True)
    view_count = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pub_news_article'
        verbose_name = 'News Article'
        verbose_name_plural = 'News Articles'
        ordering = ['-published_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class Notice(models.Model):
    NOTICE_TYPE_CHOICES = [
        ('general', 'General'),
        ('procurement', 'Procurement'),
        ('meeting', 'Meeting'),
        ('board', 'Board'),
        ('press', 'Press Release'),
    ]

    notice_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    notice_type = models.CharField(max_length=50, choices=NOTICE_TYPE_CHOICES, default='general')
    document = models.FileField(upload_to='notices/', null=True, blank=True)
    is_pinned = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pub_notice'
        verbose_name = 'Notice'
        verbose_name_plural = 'Notices'
        ordering = ['-is_pinned', '-published_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class Event(models.Model):
    EVENT_TYPE_CHOICES = [
        ('meeting', 'Meeting'),
        ('workshop', 'Workshop'),
        ('conference', 'Conference'),
        ('training', 'Training'),
        ('deadline', 'Deadline'),
        ('other', 'Other'),
    ]

    event_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES, default='meeting')
    location = models.CharField(max_length=255, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    registration_link = models.URLField(max_length=500, blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pub_event'
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        ordering = ['start_date']

    def __str__(self):
        return self.title


class FAQItem(models.Model):
    faq_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.TextField()
    answer = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pub_faq'
        verbose_name = 'FAQ Item'
        verbose_name_plural = 'FAQ Items'
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.question[:80]


class ContactMessage(models.Model):
    contact_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    replied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pub_contact_message'
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.subject}'
