# api/admin.py

from django.contrib import admin
from .models import CustomUser, Patient, PatientResult, PatientReport
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'username', 'is_admin', 'is_organization', 'organization_type', 'organization_name')
    fieldsets = UserAdmin.fieldsets + (
        ('Organization Info', {
            'fields': (
                'is_admin', 'is_organization', 'organization_type', 'organization_name',
                'organization_address', 'phone', 'organization_logo'  # ✅ add logo
            )
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Organization Info', {
            'fields': (
                'is_admin', 'is_organization', 'organization_type', 'organization_name',
                'organization_address', 'phone', 'organization_logo'  # ✅ add logo
            )
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)


admin.site.register(Patient)
admin.site.register(PatientResult)
admin.site.register(PatientReport)