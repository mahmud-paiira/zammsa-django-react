from rest_framework import serializers
from .models import BudgetAllocation, BudgetEncumbrance, GoodsReceiptNote, Invoice, ThreeWayMatch, Payment, LetterOfCredit


class BudgetAllocationSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='allocation_id', read_only=True)
    budget_code = serializers.CharField(source='entity_code', read_only=True)
    spent_amount = serializers.DecimalField(source='expended_amount', max_digits=20, decimal_places=2, read_only=True)
    remaining_amount = serializers.DecimalField(source='available', max_digits=20, decimal_places=2, read_only=True)
    available = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)

    class Meta:
        model = BudgetAllocation
        fields = '__all__'


class BudgetEncumbranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetEncumbrance
        fields = '__all__'


class GoodsReceiptNoteSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='grn_id', read_only=True)

    class Meta:
        model = GoodsReceiptNote
        fields = '__all__'
        read_only_fields = ('grn_id', 'received_date')


class ThreeWayMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreeWayMatch
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='payment_id', read_only=True)
    payment_date = serializers.DateTimeField(source='processed_at', read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('payment_id', 'created_at')


class InvoiceListSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='invoice_id', read_only=True)
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    paid_date = serializers.DateTimeField(source='paid_at', read_only=True, allow_null=True)

    class Meta:
        model = Invoice
        fields = ('id', 'invoice_id', 'invoice_number', 'contract_number', 'supplier_name', 'amount', 'status', 'due_date', 'paid_date', 'submitted_at', 'approved_at', 'paid_at', 'created_at')


class InvoiceSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='invoice_id', read_only=True)
    paid_date = serializers.DateTimeField(source='paid_at', read_only=True, allow_null=True)
    three_way_matches = ThreeWayMatchSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    grn_details = GoodsReceiptNoteSerializer(source='grn', read_only=True)
    suggested_approval_route = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ('invoice_id', 'created_at', 'updated_at', 'erp_posted_at', 'payment_advice_sent_at')

    def get_suggested_approval_route(self, obj):
        return obj.determine_approval_route()


class LetterOfCreditSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='loc_id', read_only=True)

    class Meta:
        model = LetterOfCredit
        fields = '__all__'
