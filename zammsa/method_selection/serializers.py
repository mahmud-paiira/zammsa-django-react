from rest_framework import serializers
from .models import ProcurementMethodType, MethodRecommendation, MethodOverride, NonOpenJustification, PreferenceScheme


class ProcurementMethodTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcurementMethodType
        fields = '__all__'


class MethodRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MethodRecommendation
        fields = '__all__'
        read_only_fields = ('recommendation_id', 'created_at')


class MethodOverrideSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)

    class Meta:
        model = MethodOverride
        fields = '__all__'
        read_only_fields = ('override_id', 'created_at')


class NonOpenJustificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NonOpenJustification
        fields = '__all__'
        read_only_fields = ('justification_id', 'created_at')


class PreferenceSchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreferenceScheme
        fields = '__all__'
