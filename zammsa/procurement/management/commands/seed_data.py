from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta

from accounts.models import User
from master_data.models import Department, Commodity, UnitOfMeasure, FundingSource, FiscalYear
from procurement_planning.models import AnnualProcurementPlan
from requisitions.models import Requisition, RequisitionItem, RequisitionApproval, Specification
from solicitations.models import Solicitation, EvaluationCriterion, SolicitationDocument
from bids.models import BidSubmission, BidSecurity, BidOpening, BidOpeningDetail, PreBidConference
from evaluations.models import EvaluationCommittee, TechnicalScore, FinancialEvaluation, CombinedScore, BidEvaluationReport, PreliminaryExam
from contracts.models import Contract, ContractMilestone, ContractSecurity
from finance.models import BudgetAllocation, Invoice, Payment, LetterOfCredit
from reporting.models import ProcurementWarehouse


class Command(BaseCommand):
    help = 'Seed comprehensive transaction data for testing all features'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Force re-seeding')

    def handle(self, *args, **options):
        if User.objects.count() < 10:
            self.stdout.write(self.style.ERROR('Run seed_all first!'))
            return

        users = {u.email: u for u in User.objects.all()}
        po = users['procurement.officer@zammsa.gov.zm']
        supplier_user = users['supplier@zammsa.gov.zm']
        dept_head = users['dept.head@zammsa.gov.zm']
        finance_officer = users['finance.officer@zammsa.gov.zm']
        director = users['director@zammsa.gov.zm']
        dg = users['dg@zammsa.gov.zm']
        zpc = users['zpc@zammsa.gov.zm']
        evaluator = users['evaluator@zammsa.gov.zm']
        contract_mgr = users['contract@zammsa.gov.zm']
        auditor = users['auditor@zammsa.gov.zm']

        dept = Department.objects.first()
        fy = FiscalYear.objects.filter(is_current=True).first() or FiscalYear.objects.first()
        uom = UnitOfMeasure.objects.first()
        commodity = Commodity.objects.first()
        funding = FundingSource.objects.first()

        now = timezone.now()

        # ── Budget Allocations ──
        budgets = []
        for code, name in [('MOH-HQ-001', 'Ministry of Health HQ'), ('MOH-PROV-001', 'Provincial Health Office')]:
            ba, _ = BudgetAllocation.objects.get_or_create(
                entity_code=code,
                fiscal_year=fy.year_code,
                defaults={
                    'entity_level': 'department',
                    'allocated_amount': Decimal('50000000.00'),
                    'encumbered_amount': Decimal('15000000.00'),
                    'expended_amount': Decimal('8000000.00'),
                }
            )
            budgets.append(ba)

        # ── Requisitions ──
        req_data = [
            {'desc': 'Antimalarial drugs for Q3 2026', 'val': Decimal('2500000.00'), 'req': 'REQ-2026-001', 'status': 'approved'},
            {'desc': 'Laboratory reagents and consumables', 'val': Decimal('1800000.00'), 'req': 'REQ-2026-002', 'status': 'submitted'},
            {'desc': 'Hospital beds and mattresses', 'val': Decimal('3200000.00'), 'req': 'REQ-2026-003', 'status': 'draft'},
            {'desc': 'Surgical gloves and PPE', 'val': Decimal('950000.00'), 'req': 'REQ-2026-004', 'status': 'pending_dept_head'},
            {'desc': 'Medical oxygen cylinders', 'val': Decimal('4500000.00'), 'req': 'REQ-2026-005', 'status': 'approved'},
        ]
        requisitions = []
        for rd in req_data:
            req, _ = Requisition.objects.get_or_create(
                req_number=rd['req'],
                defaults={
                    'department': dept,
                    'requester': po,
                    'description': rd['desc'],
                    'estimated_total': rd['val'],
                    'required_date': (now + timedelta(days=90)).date(),
                    'delivery_location': 'Lusaka Central Warehouse',
                    'status': rd['status'],
                    'submitted_at': now - timedelta(days=random.randint(5, 30)) if rd['status'] != 'draft' else None,
                }
            )
            RequisitionItem.objects.get_or_create(
                requisition=req,
                description=rd['desc'][:30],
                defaults={
                    'quantity': Decimal('100.00'),
                    'unit_of_measure': uom,
                    'unit_price_estimate': rd['val'] / Decimal('100'),
                    'commodity': commodity,
                }
            )
            Specification.objects.get_or_create(
                requisition=req,
                specification_type='goods',
                defaults={'content': {'description': rd['desc'], 'standards': 'WHO standards'}}
            )
            requisitions.append(req)
            self.stdout.write(f'  Requisition: {req.req_number} ({req.status})')

        # ── Solicitations ──
        sol_data = [
            {'req': requisitions[0], 'sol': 'SOL-2026-001', 'title': 'Supply of Antimalarial Drugs', 'method': 'open', 'status': 'published'},
            {'req': requisitions[4], 'sol': 'SOL-2026-002', 'title': 'Medical Oxygen Cylinder Supply', 'method': 'open', 'status': 'published'},
        ]
        solicitations = []
        for sd in sol_data:
            sol, _ = Solicitation.objects.get_or_create(
                sol_number=sd['sol'],
                defaults={
                    'requisition': sd['req'],
                    'title': sd['title'],
                    'description': f'{sd["title"]} - Open tender for procurement',
                    'method': sd['method'],
                    'closing_date': now + timedelta(days=30),
                    'opening_date': now + timedelta(days=31),
                    'status': sd['status'],
                    'published_at': now - timedelta(days=5),
                    'created_by': po,
                }
            )
            # Evaluation criteria
            for cname, ctype, weight in [
                ('Experience', 'technical', Decimal('30.00')),
                ('Methodology', 'technical', Decimal('25.00')),
                ('Team Qualifications', 'technical', Decimal('20.00')),
                ('Price', 'financial', Decimal('25.00')),
            ]:
                EvaluationCriterion.objects.get_or_create(
                    solicitation=sol,
                    criterion_name=cname,
                    defaults={
                        'criterion_type': ctype,
                        'weight': weight,
                        'order_index': ['Experience', 'Methodology', 'Team Qualifications', 'Price'].index(cname),
                    }
                )
            SolicitationDocument.objects.get_or_create(
                solicitation=sol,
                document_type='bidding_document',
                defaults={
                    'file_path': f'/documents/{sol.sol_number}/bidding_document.pdf',
                    'is_public': True,
                }
            )
            solicitations.append(sol)
            self.stdout.write(f'  Solicitation: {sol.sol_number} ({sol.status})')

        # ── Additional supplier users for bidding ──
        supplier_emails = ['supplier1@pharmahealth.zm', 'supplier2@medsupply.zm', 'supplier3@globalmed.zm']
        supplier_names = ['PharmaHealth Ltd', 'MedSupply Zambia', 'GlobalMed Inc']
        supplier_users = [supplier_user]
        for semail, sname in zip(supplier_emails, supplier_names):
            u, _ = User.objects.get_or_create(
                email=semail,
                defaults={
                    'employee_id': f'SUP-{sname[:3].upper()}',
                    'full_name': f'{sname} Rep',
                    'role': 'supplier_user',
                    'is_active': True,
                }
            )
            if _:
                u.set_password('Test@123')
                u.save()
            supplier_users.append(u)

        # ── Bids ──
        bid_prices = [Decimal('2350000.00'), Decimal('2480000.00'), Decimal('2210000.00')]
        bids = []
        for i, sol in enumerate(solicitations):
            for j in range(3):
                bid_sub, _ = BidSubmission.objects.get_or_create(
                    submission_id=f'BID-{sol.sol_number}-{j+1:02d}',
                    defaults={
                        'solicitation': sol,
                        'supplier': supplier_users[j],
                        'bid_price': bid_prices[j] + Decimal(random.randint(-50000, 50000)),
                        'status': 'submitted',
                        'submitted_at': now - timedelta(days=2),
                    }
                )
                BidSecurity.objects.get_or_create(
                    bid=bid_sub,
                    security_type='bank_guarantee',
                    defaults={
                        'amount': bid_sub.bid_price * Decimal('0.02'),
                        'issuing_institution': f'Bank of Zambia - {supplier_names[j]}',
                        'reference_number': f'BG-{bid_sub.submission_id}',
                        'validity_date': (now + timedelta(days=120)).date(),
                        'verification_status': 'verified',
                    }
                )
                PreBidConference.objects.get_or_create(
                    solicitation=sol,
                    scheduled_date=now + timedelta(days=15),
                    defaults={
                        'location': 'ZAMMSA Conference Room, Lusaka',
                        'attendance_list': [
                            {'name': supplier_names[j], 'attendees': ['Representative']},
                            {'name': 'ZAMMSA', 'attendees': ['Procurement Team']},
                        ],
                    }
                )
                bids.append(bid_sub)
                self.stdout.write(f'  Bid: {bid_sub.submission_id}')

        # Bid opening
        for sol in solicitations:
            opening, _ = BidOpening.objects.get_or_create(
                solicitation=sol,
                conducted_by=po,
                defaults={
                    'opened_at': now - timedelta(days=1),
                    'witnesses': ['Internal Auditor', 'Supplier Representative'],
                }
            )
            for idx, bid in enumerate(BidSubmission.objects.filter(solicitation=sol)):
                BidOpeningDetail.objects.get_or_create(
                    opening=opening,
                    bid=bid,
                    defaults={
                        'opened_sequence': idx + 1,
                        'price_read': bid.bid_price,
                    }
                )

        # ── Evaluations ──
        for sol in solicitations:
            committee, _ = EvaluationCommittee.objects.get_or_create(
                solicitation=sol,
                chairperson=director,
                defaults={
                    'secretary': po,
                    'members': [evaluator.full_name, po.full_name, dept_head.full_name],
                }
            )
            for bid in BidSubmission.objects.filter(solicitation=sol):
                for crit in EvaluationCriterion.objects.filter(solicitation=sol):
                    TechnicalScore.objects.get_or_create(
                        bid=bid,
                        evaluator=evaluator,
                        criterion=crit,
                        defaults={
                            'raw_score': Decimal(random.randint(60, 95)),
                            'weighted_score': Decimal(random.randint(60, 95)) * crit.weight / Decimal('100'),
                            'comment': '',
                        }
                    )
                is_responsive = random.random() > 0.2
                if is_responsive:
                    prelim, _ = PreliminaryExam.objects.get_or_create(
                        bid=bid,
                        criterion='Documentation Completeness',
                        defaults={'is_compliant': True, 'comment': 'All documents provided'}
                    )
                    fe, _ = FinancialEvaluation.objects.get_or_create(
                        bid=bid,
                        defaults={
                            'original_price': bid.bid_price,
                            'corrected_price': bid.bid_price,
                            'evaluated_price': bid.bid_price,
                            'financial_score': Decimal(random.randint(70, 100)),
                        }
                    )

            # Combined scores & BER for first solicitation
            if sol == solicitations[0]:
                biss = list(BidSubmission.objects.filter(solicitation=sol))
                scores = []
                for bid in biss:
                    ts = TechnicalScore.objects.filter(bid=bid)
                    avg_tech = sum(t.weighted_score for t in ts) / max(len(ts), 1)
                    avg_tech = max(avg_tech, Decimal('50'))
                    fe = FinancialEvaluation.objects.filter(bid=bid).first()
                    fin_score = fe.financial_score if fe else Decimal('70')
                    total = avg_tech * Decimal('0.7') + fin_score * Decimal('0.3')
                    scores.append((bid, total))
                scores.sort(key=lambda x: -x[1])
                for rank, (bid, total) in enumerate(scores, 1):
                    CombinedScore.objects.get_or_create(
                        bid=bid,
                        defaults={
                            'technical_score': avg_tech,
                            'financial_score': fin_score,
                            'total_score': total,
                            'rank': rank,
                        }
                    )

                ber, _ = BidEvaluationReport.objects.get_or_create(
                    solicitation=sol,
                    defaults={
                        'report_content': {'recommendation': 'Award to lowest evaluated bidder', 'summary': 'Evaluation completed successfully'},
                        'status': 'approved',
                        'created_by': po,
                        'approved_by': dg,
                        'approved_at': now - timedelta(hours=6),
                    }
                )
                # ── Contract ──
                supplier = None
                try:
                    from suppliers.models import Supplier
                    supplier, _ = Supplier.objects.get_or_create(
                        registration_number='PA-2026-001',
                        defaults={
                            'tin': 'ZM1000012026',
                            'name': 'PharmaHealth Zambia Ltd',
                            'ceec_category': 'non_citizen',
                            'status': 'approved',
                        }
                    )
                except Exception:
                    pass

                if supplier:
                    winner_bid = scores[0][0]
                    ctr, _ = Contract.objects.get_or_create(
                        contract_number=f'CTR-{sol.sol_number}',
                        defaults={
                            'solicitation': sol,
                            'winning_bid': winner_bid,
                            'supplier': supplier,
                            'contract_type': 'po',
                            'value': winner_bid.bid_price,
                            'start_date': now.date(),
                            'end_date': (now + timedelta(days=365)).date(),
                            'status': 'active',
                            'contract_manager': contract_mgr,
                            'award_date': now.date() - timedelta(days=5),
                            'acceptance_date': now.date() - timedelta(days=3),
                        }
                    )
                    ContractMilestone.objects.get_or_create(
                        contract=ctr,
                        milestone_name='Initial Delivery',
                        defaults={
                            'due_date': (now + timedelta(days=90)).date(),
                            'status': 'pending',
                        }
                    )
                    ContractMilestone.objects.get_or_create(
                        contract=ctr,
                        milestone_name='Final Delivery',
                        defaults={
                            'due_date': (now + timedelta(days=365)).date(),
                            'status': 'pending',
                        }
                    )
                    self.stdout.write(f'  Contract: {ctr.contract_number} ({ctr.status})')

                    # ── Invoice ──
                    inv, _ = Invoice.objects.get_or_create(
                        contract=ctr,
                        invoice_number=f'INV-{ctr.contract_number}-001',
                        defaults={
                            'supplier': supplier,
                            'amount': ctr.value * Decimal('0.3'),
                            'status': 'submitted',
                            'submitted_at': now - timedelta(days=2),
                        }
                    )
                    self.stdout.write(f'  Invoice: {inv.invoice_number} ({inv.status})')

                    # ── Payment (for seeding processed payment data) ──
                    Payment.objects.get_or_create(
                        invoice=inv,
                        amount=inv.amount,
                        payment_method='electronic',
                        defaults={
                            'status': 'processing',
                            'processed_at': None,
                        }
                    )

                    # ── Letter of Credit ──
                    LetterOfCredit.objects.get_or_create(
                        contract=ctr,
                        loc_type='sight',
                        defaults={
                            'amount': ctr.value,
                            'issuing_bank': 'Bank of Zambia',
                            'beneficiary': supplier.name,
                            'status': 'issued',
                            'expiry_date': (now + timedelta(days=395)).date(),
                        }
                    )
                    self.stdout.write(f'  Letter of Credit for {ctr.contract_number}')

        # ── Audit Logs ──
        from accounts.models import AuditLog
        actions = [
            ('login', 'User logged in'),
            ('create', f'Created requisition {requisitions[0].req_number}'),
            ('submit', f'Submitted requisition {requisitions[0].req_number}'),
            ('approve', f'Approved requisition {requisitions[0].req_number}'),
            ('create', f'Created solicitation {solicitations[0].sol_number}'),
            ('publish', f'Published solicitation {solicitations[0].sol_number}'),
            ('create', f'Received bid BID-{solicitations[0].sol_number}-01'),
            ('evaluate', f'Completed evaluation for {solicitations[0].sol_number}'),
            ('approve', f'Approved BER for {solicitations[0].sol_number}'),
            ('create', f'Awarded contract CTR-{solicitations[0].sol_number}'),
        ]
        for action, desc in actions:
            AuditLog.objects.get_or_create(
                action=action,
                module='procurement',
                record_id=str(po.id)[:8],
                defaults={
                    'user': po,
                    'ip_address': '127.0.0.1',
                    'timestamp': now - timedelta(minutes=random.randint(10, 500)),
                    'new_value': {'description': desc},
                }
            )
        self.stdout.write('  Audit logs created')

        # ── Procurement Warehouse (reporting) ──
        statuses = ['active', 'published', 'completed', 'awarded', 'cancelled']
        for i in range(15):
            status = random.choice(statuses)
            ProcurementWarehouse.objects.get_or_create(
                procurement_id=f'WH-2026-{i+1:04d}',
                defaults={
                    'value': Decimal(random.randint(100000, 5000000)),
                    'method': random.choice(['open', 'limited', 'direct', 'request_for_quotation']),
                    'department': random.choice([dept.dept_name for dept in Department.objects.all()[:5]]),
                    'status': status,
                    'processing_days': random.randint(10, 120),
                    'award_date': now.date() - timedelta(days=random.randint(0, 365)),
                    'supplier_category': random.choice(['pharmaceutical', 'medical_equipment', 'consumables', 'services', 'infrastructure']),
                }
            )
        self.stdout.write('  Warehouse facts created')

        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('Transaction data seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('Login as procurement.officer@zammsa.gov.zm / Test@123 to test all features')
