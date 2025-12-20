# myapp/admin.py
from django.contrib import admin
from .models import User, FAQ, ContactInfo, SupportTicket

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone', 'created_at']
    search_fields = ['name', 'email', 'phone']
    list_filter = ['created_at']
    readonly_fields = ['password', 'created_at', 'updated_at']


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['id', 'question', 'order', 'is_active', 'created_at']
    search_fields = ['question', 'answer']
    list_filter = ['is_active', 'created_at']
    list_editable = ['order', 'is_active']
    ordering = ['order', '-created_at']


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ['id', 'phone', 'email', 'whatsapp', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    list_editable = ['is_active']


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'issue_type', 'status', 'created_at']
    search_fields = ['message', 'admin_response', 'user__name', 'user__email']
    list_filter = ['issue_type', 'status', 'created_at']
    list_editable = ['status']
    readonly_fields = ['user', 'issue_type', 'message', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Ticket Information', {
            'fields': ('user', 'issue_type', 'message', 'status')
        }),
        ('Admin Response', {
            'fields': ('admin_response',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )