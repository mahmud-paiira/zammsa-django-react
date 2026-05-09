from rest_framework import serializers
from .models import Department, FiscalYear, Commodity, UnitOfMeasure, FundingSource, DocumentTemplate, RiskLibrary, ApprovalMatrix, ChangeRequest


class DepartmentSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent_department.dept_name', read_only=True, allow_null=True)

    class Meta:
        model = Department
        fields = '__all__'

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return DepartmentSerializer(children, many=True).data if children else []


class DepartmentListSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent_department.dept_name', read_only=True, allow_null=True)

    class Meta:
        model = Department
        fields = ('dept_id', 'dept_code', 'dept_name', 'parent_name', 'level', 'region', 'is_active')


class FiscalYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiscalYear
        fields = '__all__'


class UnitOfMeasureSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitOfMeasure
        fields = '__all__'


class CommoditySerializer(serializers.ModelSerializer):
    uom_name = serializers.CharField(source='unit_of_measure.uom_name', read_only=True, allow_null=True)

    class Meta:
        model = Commodity
        fields = '__all__'


class FundingSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundingSource
        fields = '__all__'


class DocumentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class RiskLibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskLibrary
        fields = '__all__'


class ApprovalMatrixSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalMatrix
        fields = '__all__'


class ChangeRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(source='requested_by.full_name', read_only=True)
    approved_by_first_name = serializers.CharField(source='approved_by_first.full_name', read_only=True, allow_null=True)
    approved_by_second_name = serializers.CharField(source='approved_by_second.full_name', read_only=True, allow_null=True)

    class Meta:
        model = ChangeRequest
        fields = '__all__'
        read_only_fields = ('requested_by', 'status', 'approved_by_first', 'approved_by_second', 'approved_at', 'created_at', 'updated_at')


class ChangeRequestApproveSerializer(serializers.Serializer):
    approve = serializers.BooleanField()
    comment = serializers.CharField(required=False, allow_blank=True)
