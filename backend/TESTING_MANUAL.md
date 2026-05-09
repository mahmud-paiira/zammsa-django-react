# ZAMMSA e-Procurement System — Testing Manual

> **API Base URL:** `http://localhost:8000/api/v1/`
> **Auth:** JWT Bearer Token via `Authorization: Bearer <token>`
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Setup & Authentication](#1-setup--authentication)
2. [Master Data Management](#2-master-data-management)
3. [System Configuration](#3-system-configuration)
4. [Procurement Planning (APP)](#4-procurement-planning-app)
5. [Requisitions](#5-requisitions)
6. [Method Selection](#6-method-selection)
7. [Supplier Registration](#7-supplier-registration)
8. [Solicitations (Tendering)](#8-solicitations-tendering)
9. [Bid Submission & Opening](#9-bid-submission--opening)
10. [Bid Evaluation](#10-bid-evaluation)
11. [Contracts](#11-contracts)
12. [Finance (Budget, Invoicing, Payment)](#12-finance)
13. [Supplier Performance Management](#13-supplier-performance-management)
14. [Reporting & Dashboards](#14-reporting--dashboards)
15. [Public Portal](#15-public-portal)
16. [Integrations](#16-integrations)

---

## 1. Setup & Authentication

### 1.1 Create Test Users

Create users for each role in the system. Use the `POST /api/v1/users/create/` endpoint (system_admin only).

```bash
# Create Director General
POST /api/v1/users/create/
{
  "employee_id": "DG-001",
  "full_name": "Director General",
  "email": "dg@zammsa.zm",
  "password": "Test@123",
  "role": "director_general",
  "department": "HQ",
  "phone": "+260977000001"
}

# Create Procurement Manager
POST /api/v1/users/create/
{
  "employee_id": "PM-001",
  "full_name": "Procurement Manager",
  "email": "pm@zammsa.zm",
  "password": "Test@123",
  "role": "procurement_manager",
  "department": "Procurement"
}

# Create Procurement Officer
POST /api/v1/users/create/
{
  "employee_id": "PO-001",
  "full_name": "Procurement Officer",
  "email": "po@zammsa.zm",
  "password": "Test@123",
  "role": "procurement_officer",
  "department": "Procurement"
}

# Create Department Head
POST /api/v1/users/create/
{
  "employee_id": "DH-001",
  "full_name": "Dept Head Health",
  "email": "dh@zammsa.zm",
  "password": "Test@123",
  "role": "department_head",
  "department": "Health Programmes"
}

# Create User Dept Staff
POST /api/v1/users/create/
{
  "employee_id": "US-001",
  "full_name": "User Staff",
  "email": "staff@zammsa.zm",
  "password": "Test@123",
  "role": "user_dept_staff",
  "department": "Health Programmes"
}

# Create Finance Officer
POST /api/v1/users/create/
{
  "employee_id": "FO-001",
  "full_name": "Finance Officer",
  "email": "fo@zammsa.zm",
  "password": "Test@123",
  "role": "finance_officer",
  "department": "Finance"
}

# Create ZPC Member
POST /api/v1/users/create/
{
  "employee_id": "ZPC-001",
  "full_name": "ZPC Member",
  "email": "zpc@zammsa.zm",
  "password": "Test@123",
  "role": "zpc_member",
  "department": "Procurement"
}

# Create Director of Procurement
POST /api/v1/users/create/
{
  "employee_id": "DP-001",
  "full_name": "Director Procurement",
  "email": "dirproc@zammsa.zm",
  "password": "Test@123",
  "role": "director_procurement",
  "department": "Procurement"
}

# Create Evaluation Committee Chair
POST /api/v1/users/create/
{
  "employee_id": "EC-001",
  "full_name": "EC Chair",
  "email": "ecchair@zammsa.zm",
  "password": "Test@123",
  "role": "evaluation_committee_chair",
  "department": "Procurement"
}

# Create Evaluation Committee Member
POST /api/v1/users/create/
{
  "employee_id": "EC-002",
  "full_name": "EC Member 1",
  "email": "ecm1@zammsa.zm",
  "password": "Test@123",
  "role": "evaluation_committee_member",
  "department": "Procurement"
}

# Create Contract Manager
POST /api/v1/users/create/
{
  "employee_id": "CM-001",
  "full_name": "Contract Manager",
  "email": "cm@zammsa.zm",
  "password": "Test@123",
  "role": "contract_manager",
  "department": "Procurement"
}

# Create Supplier User (will be auto-created during supplier approval)
# Create ZPPA Reporting Officer
POST /api/v1/users/create/
{
  "employee_id": "ZR-001",
  "full_name": "ZPPA Reporter",
  "email": "zppa@zammsa.zm",
  "password": "Test@123",
  "role": "zppa_reporting_officer",
  "department": "Procurement"
}

# Create System Admin (already exists if you seeded)
POST /api/v1/users/create/
{
  "employee_id": "SA-001",
  "full_name": "System Admin",
  "email": "admin@zammsa.zm",
  "password": "Test@123",
  "role": "system_admin",
  "department": "ICT"
}

# Create Auditor
POST /api/v1/users/create/
{
  "employee_id": "AU-001",
  "full_name": "Auditor",
  "email": "auditor@zammsa.zm",
  "password": "Test@123",
  "role": "auditor",
  "department": "Audit"
}
```

### 1.2 Authentication

```bash
# Login (returns JWT tokens)
POST /api/v1/auth/login/
{
  "email": "dg@zammsa.zm",
  "password": "Test@123"
}
# Response:
{
  "refresh": "eyJ...",
  "access": "eyJ..."
}

# Use the access token in subsequent requests:
# Authorization: Bearer eyJ...

# Get current user profile
GET /api/v1/auth/me/

# Change password
POST /api/v1/auth/change-password/
{
  "old_password": "Test@123",
  "new_password": "NewPass@456"
}

# Forgot password
POST /api/v1/auth/forgot-password/
{ "email": "staff@zammsa.zm" }

# Reset password (use token from email)
POST /api/v1/auth/reset-password/
{ "token": "...", "new_password": "NewPass@789" }

# MFA Setup (scan QR code)
GET /api/v1/auth/mfa/setup/
POST /api/v1/auth/mfa/setup/
{ "code": "123456" }  # verify with authenticator app

# MFA Login (if MFA enabled)
POST /api/v1/auth/mfa-login/
{ "email": "dg@zammsa.zm", "code": "123456" }

# Logout (blacklists refresh token)
POST /api/v1/auth/logout/
{ "refresh": "eyJ..." }
```

### 1.3 Seed Initial Data (If Not Already Seeded)

```bash
# If using fixtures
python manage.py loaddata fixtures/initial_data.json

# Or use the admin interface at:
# http://localhost:8000/admin/
```

---

## 2. Master Data Management

Manage reference data that drives the entire procurement system.

### 2.1 Departments

```bash
# List all departments
GET /api/v1/master-data/departments/

# Get department tree (hierarchical)
GET /api/v1/master-data/departments/tree/

# Create department
POST /api/v1/master-data/departments/
{
  "dept_code": "ICT",
  "dept_name": "Information & Communication Technology",
  "level": "national",
  "budget_code": "BUD-ICT-001"
}

# Update department
PUT /api/v1/master-data/departments/<uuid:pk>/
{ "dept_name": "ICT Department" }

# Deactivate department
DELETE /api/v1/master-data/departments/<uuid:pk>/
```

### 2.2 Fiscal Years

```bash
# List fiscal years
GET /api/v1/master-data/fiscal-years/

# Create fiscal year
POST /api/v1/master-data/fiscal-years/
{
  "year_code": "2026-2027",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "is_current": true,
  "is_closed": false
}
```

### 2.3 Units of Measure

```bash
# List UoM
GET /api/v1/master-data/units-of-measure/

# Create UoM
POST /api/v1/master-data/units-of-measure/
{
  "uom_code": "LTR",
  "uom_name": "Litre",
  "category": "volume"
}
```

### 2.4 Commodities

```bash
# List commodities
GET /api/v1/master-data/commodities/

# Create commodity
POST /api/v1/master-data/commodities/
{
  "commodity_code": "MED-001",
  "commodity_name": "Paracetamol 500mg",
  "category": "pharmaceuticals",
  "sub_category": "pain_relief",
  "unit_of_measure": "<uom_uuid>"
}
```

### 2.5 Funding Sources

```bash
# List funding sources
GET /api/v1/master-data/funding-sources/

# Create funding source
POST /api/v1/master-data/funding-sources/
{
  "source_code": "GRZ-001",
  "source_name": "Government of Zambia - Health",
  "type": "government",
  "budget_reference": "GRZ-BUD-2026"
}

# Create donor funding
POST /api/v1/master-data/funding-sources/
{
  "source_code": "GFTM-001",
  "source_name": "Global Fund TB & Malaria",
  "type": "donor",
  "budget_reference": "GF-2026-ZAM"
}
```

### 2.6 Document Templates

```bash
# List templates
GET /api/v1/master-data/document-templates/

# Create ITB template
POST /api/v1/master-data/document-templates/
{
  "template_name": "ITB - Pharmaceuticals",
  "document_type": "invitation_to_bid",
  "template_content": "INVITATION TO BID\n\nZAMMSA/ITB/{{year}}/{{number}}\n\n{{content}}",
  "is_active": true
}
```

### 2.7 Approval Matrix

```bash
# List approval matrix rules
GET /api/v1/master-data/approval-matrix/

# Create approval rule
POST /api/v1/master-data/approval-matrix/
{
  "procurement_type": "goods",
  "value_threshold_min": 0,
  "value_threshold_max": 250000,
  "approval_flow": ["department_head", "director_general"],
  "requires_zpc": false,
  "is_active": true
}

# Create ZPC-level rule
POST /api/v1/master-data/approval-matrix/
{
  "procurement_type": "goods",
  "value_threshold_min": 250001,
  "value_threshold_max": 999999999,
  "approval_flow": ["department_head", "director_general", "zpc_member"],
  "requires_zpc": true,
  "is_active": true
}
```

### 2.8 Risk Library

```bash
# List risk categories
GET /api/v1/master-data/risk-library/

# Create risk entry
POST /api/v1/master-data/risk-library/
{
  "risk_category": "supplier_default",
  "risk_description": "Supplier fails to deliver on time",
  "default_mitigation": "Require performance security for contracts >1M ZMW",
  "severity_level": "high"
}
```

### 2.9 Change Requests (Master Data)

```bash
# List change requests
GET /api/v1/master-data/change-requests/

# Create change request
POST /api/v1/master-data/change-requests/
{
  "entity_type": "commodity",
  "entity_id": "<commodity_uuid>",
  "requested_change": {"unit_of_measure": "<new_uom_uuid>"},
  "reason": "Standardizing UoM across all pharmaceuticals"
}

# Approve change request (requires 2-person approval chain)
POST /api/v1/master-data/change-requests/<uuid:pk>/approve/
```

---

## 3. System Configuration

### 3.1 System Settings

```bash
# List settings
GET /api/v1/system-config/settings/

# Create/update setting
POST /api/v1/system-config/settings/
{
  "setting_key": "BID_BOND_PERCENTAGE",
  "setting_value": 2.0,
  "data_type": "float",
  "category": "procurement",
  "description": "Bid security as percentage of estimated value"
}

POST /api/v1/system-config/settings/
{
  "setting_key": "PERFORMANCE_BOND_PERCENTAGE",
  "setting_value": 10.0,
  "data_type": "float",
  "category": "procurement"
}

POST /api/v1/system-config/settings/
{
  "setting_key": "SESSION_TIMEOUT_MINUTES",
  "setting_value": 30,
  "data_type": "integer",
  "category": "security"
}
```

### 3.2 Threshold Rules

```bash
# List threshold rules
GET /api/v1/system-config/threshold-rules/

# Create open tender threshold
POST /api/v1/system-config/threshold-rules/
{
  "rule_key": "OPEN_TENDER_MIN",
  "rule_name": "Open Tendering Threshold",
  "min_value": 200000,
  "max_value": null,
  "currency": "ZMW",
  "applies_to": "procurement",
  "default_method": "open_tender",
  "is_active": true
}

# Create simplified bidding threshold
POST /api/v1/system-config/threshold-rules/
{
  "rule_key": "SIMPLIFIED_BIDDING",
  "rule_name": "Simplified Bidding Threshold",
  "min_value": 50000,
  "max_value": 200000,
  "applies_to": "procurement",
  "default_method": "simplified",
  "is_active": true
}

# Create direct procurement threshold
POST /api/v1/system-config/threshold-rules/
{
  "rule_key": "DIRECT_PROCUREMENT",
  "rule_name": "Direct Procurement Limit",
  "min_value": 0,
  "max_value": 50000,
  "applies_to": "procurement",
  "default_method": "direct",
  "is_active": true
}
```

### 3.3 Preference Rules (Local Content)

```bash
# List preference rules
GET /api/v1/system-config/preference-rules/

# Create citizen-owned preference margin
POST /api/v1/system-config/preference-rules/
{
  "preference_key": "CITIZEN_OWNED_12",
  "preference_name": "Citizen-Owned Preference",
  "value": {"margin": 12, "ceec_category": "citizen_owned"},
  "is_current": true
}
```

### 3.4 Workflow Stages

```bash
# List workflow stages
GET /api/v1/system-config/workflow-stages/

# Create requisition workflow
POST /api/v1/system-config/workflow-stages/
{
  "workflow_name": "requisition_approval",
  "stage_order": 1,
  "stage_name": "Department Head Review",
  "stage_code": "pending_dept_head",
  "allowed_roles": ["department_head"],
  "allowed_actions": ["approve", "reject", "return"],
  "time_limit_hours": 48
}
```

### 3.5 Notification Templates

```bash
# List templates
GET /api/v1/system-config/notification-templates/

# Create email template
POST /api/v1/system-config/notification-templates/
{
  "template_key": "APP_APPROVED",
  "subject_template": "APP {{app_code}} Approved",
  "body_template": "Your Annual Procurement Plan {{app_code}} has been approved.",
  "placeholders": ["app_code"],
  "is_active": true
}
```

### 3.6 Scheduled Tasks

```bash
# List scheduled tasks
GET /api/v1/system-config/scheduled-tasks/

# Create task schedule
POST /api/v1/system-config/scheduled-tasks/
{
  "task_name": "ETL Data Warehouse Refresh",
  "task_type": "celery_beat",
  "schedule_cron": "0 2 * * *",
  "parameters": {},
  "is_enabled": true
}
```

---

## 4. Procurement Planning (APP)

### 4.1 Create Annual Procurement Plan

```bash
# Login as User Dept Staff
POST /api/v1/auth/login/
{ "email": "staff@zammsa.zm", "password": "Test@123" }
# → get access_token

# Create APP
POST /api/v1/procurement-planning/annual-plans/
{
  "fiscal_year": "<fy_uuid>",
  "department": "<dept_uuid>"
}
# Response: APP with status "draft", save app_uuid
```

### 4.2 Add Line Items

```bash
# Add line items to APP
POST /api/v1/procurement-planning/line-items/
{
  "app": "<app_uuid>",
  "description": "Paracetamol 500mg 1000 packs",
  "estimated_value": 150000,
  "planned_issue_date": "2026-03-01",
  "planned_award_date": "2026-06-01",
  "funding_source": "<funding_uuid>",
  "commodity": "<commodity_uuid>"
}
# Note: recommended_method is auto-populated from ThresholdRule

# Add second line item
POST /api/v1/procurement-planning/line-items/
{
  "app": "<app_uuid>",
  "description": "Amoxicillin 250mg 500 packs",
  "estimated_value": 120000,
  "planned_issue_date": "2026-04-01",
  "planned_award_date": "2026-07-01",
  "funding_source": "<funding_uuid>",
  "commodity": "<commodity_uuid>"
}

# List line items for APP
GET /api/v1/procurement-planning/line-items/?app=<app_uuid>

# Update line item (estimated_value change triggers method re-recommendation)
PUT /api/v1/procurement-planning/line-items/<uuid:pk>/
{ "estimated_value": 180000 }

# Get APP detail (shows total_estimated_value)
GET /api/v1/procurement-planning/annual-plans/<app_uuid>/
```

### 4.3 Submit APP for Department Head Review

```bash
# Submit APP (status: draft → dept_head_review)
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/submit/
# Response: { "message": "APP submitted", "status": "dept_head_review" }

# Test: Budget check blocks if no allocation exists
# (BudgetAllocation must exist for the department + fiscal year)
```

### 4.4 Department Head Approval

```bash
# Login as Department Head
POST /api/v1/auth/login/
{ "email": "dh@zammsa.zm", "password": "Test@123" }

# Approve APP
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/approve/
# Response: status → "procurement_review"

# Test: Reject with reason
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/reject/
{ "reason": "Line item values exceed department budget allocation" }

# Test: Return to draft
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/return/
{ "reason": "Please revise estimated values" }
```

### 4.5 Procurement Officer Actions

```bash
# Login as Procurement Officer
POST /api/v1/auth/login/
{ "email": "po@zammsa.zm", "password": "Test@123" }

# Compliance check
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/compliance/
{
  "compliance_status": "compliant",
  "notes": "All items meet regulatory requirements"
}

# Test: Non-compliant returns to draft
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/compliance/
{
  "compliance_status": "non_compliant",
  "notes": "Missing funding source for item 2"
}

# Consolidate line items into another APP
POST /api/v1/procurement-planning/annual-plans/<source_uuid>/consolidate/
{
  "consolidate_into": "<target_app_uuid>",
  "notes": "Consolidating overlapping procurements"
}

# Approve (forward to Director Review)
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/approve/
# → status: "director_review"
```

### 4.6 Director of Procurement Review

```bash
# Login as Director of Procurement
POST /api/v1/auth/login/
{ "email": "dirproc@zammsa.zm", "password": "Test@123" }

# Approve (forward to ZPC Review)
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/approve/
# → status: "zpc_review"
```

### 4.7 ZPC Approval

```bash
# Login as ZPC Member
POST /api/v1/auth/login/
{ "email": "zpc@zammsa.zm", "password": "Test@123" }

# Approve with ZPC resolution
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/approve/
{
  "zpc_minutes": "ZPC/2026/03/15",
  "zpc_resolution_number": "ZPC-RES-2026-042"
}
# → status: "approved"
# Note: GPN is auto-generated when APP reaches "approved" status
```

### 4.8 Publish APP

```bash
# Login as any authorized user
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/publish/
# → status: "published"
```

### 4.9 View Approval Trail

```bash
# View full audit trail
GET /api/v1/procurement-planning/annual-plans/<app_uuid>/approval-trail/
# Response: [{"action": "submit", "role": "user_dept_staff", ...}, ...]
```

### 4.10 APP Dashboard

```bash
GET /api/v1/procurement-planning/annual-plans/dashboard/
# Response: { "total_apps": 10, "by_status": [...], "total_value": 5000000 }
```

### 4.11 General Procurement Notice (GPN)

```bash
# View GPNs for APP
GET /api/v1/procurement-planning/notices/?app=<app_uuid>

# Manual GPN generation (if not auto-generated)
POST /api/v1/procurement-planning/annual-plans/<app_uuid>/generate-gpn/

# Publish GPN to multi-channels
POST /api/v1/procurement-planning/notices/<gpn_uuid>/publish/
{
  "targets": ["website", "e_gp_portal", "government_gazette"],
  "proof_urls": ["https://example.com/gpn-001.pdf"]
}

# Archive GPN
POST /api/v1/procurement-planning/notices/<gpn_uuid>/archive/
```

---

## 5. Requisitions

### 5.1 Create Requisition

```bash
# Login as User Dept Staff
POST /api/v1/auth/login/
{ "email": "staff@zammsa.zm", "password": "Test@123" }

# Create requisition
POST /api/v1/requisitions/
{
  "department": "<dept_uuid>",
  "description": "Pharmaceutical supply Q1 2026",
  "estimated_total": 270000,
  "required_date": "2026-04-15",
  "delivery_location": "ZAMMSA Central Warehouse, Lusaka"
}
# Save req_uuid
```

### 5.2 Add Requisition Items

```bash
# Add items
POST /api/v1/requisitions/items/
{
  "requisition": "<req_uuid>",
  "item_code": "MED-001",
  "description": "Paracetamol 500mg",
  "quantity": 1000,
  "unit_of_measure": "<uom_uuid>",
  "unit_price_estimate": 150,
  "commodity": "<commodity_uuid>"
}

# Add second item
POST /api/v1/requisitions/items/
{
  "requisition": "<req_uuid>",
  "item_code": "MED-002",
  "description": "Amoxicillin 250mg",
  "quantity": 500,
  "unit_price_estimate": 240,
  "commodity": "<commodity_uuid>"
}
```

### 5.3 Add Specifications

```bash
# Goods specification
POST /api/v1/requisitions/specifications/
{
  "requisition": "<req_uuid>",
  "specification_type": "goods",
  "content": {
    "quality_standard": "USP/BP",
    "shelf_life_min_months": 24,
    "packaging": "Blister pack of 10",
    "storage_conditions": "Store below 25°C"
  }
}
```

### 5.4 Submit Requisition

```bash
# Submit for approval
POST /api/v1/requisitions/<req_uuid>/submit/
# Response:
# {
#   "message": "Requisition submitted",
#   "status": "pending_dept_head",
#   "budget_check": "ok" | "insufficient"
# }
# Note: Auto-checks BudgetAllocation.available for each item
# If budget sufficient: auto-encumbers the amount
```

### 5.5 Department Head Approval

```bash
# Login as Department Head
POST /api/v1/auth/login/
{ "email": "dh@zammsa.zm", "password": "Test@123" }

# Approve
POST /api/v1/requisitions/<req_uuid>/approve/
{ "decision": "approved", "comments": "Budget confirmed" }
# → status: "pending_finance"

# Test: Reject
POST /api/v1/requisitions/<req_uuid>/approve/
{ "decision": "rejected", "comments": "Insufficient justification" }

# Test: Return for revision
POST /api/v1/requisitions/<req_uuid>/approve/
{ "decision": "returned", "comments": "Please add specifications" }
```

### 5.6 Finance Budget Validation

```bash
# Login as Finance Officer
POST /api/v1/auth/login/
{ "email": "fo@zammsa.zm", "password": "Test@123" }

# Validate budget (if not auto-validated)
POST /api/v1/requisitions/<req_uuid>/budget-validate/
# → Encumbers budget, updates BudgetAllocation.encumbered_amount
# → Status routing:
#     ≤ 250,000: "pending_dg"
#     > 250,000: "pending_zpc"
```

### 5.7 Director General Approval (≤250K)

```bash
# Login as Director General
POST /api/v1/auth/login/
{ "email": "dg@zammsa.zm", "password": "Test@123" }

# Approve
POST /api/v1/requisitions/<req_uuid>/approve/
{ "decision": "approved" }
# → status: "approved"
```

### 5.8 ZPC Approval (>250K)

```bash
# Login as ZPC Member
POST /api/v1/auth/login/
{ "email": "zpc@zammsa.zm", "password": "Test@123" }

# Approve
POST /api/v1/requisitions/<req_uuid>/approve/
{ "decision": "approved" }
# → status: "approved"
```

### 5.9 Requisition Tracking & Amendments

```bash
# View tracking (days at each stage)
GET /api/v1/requisitions/<req_uuid>/tracking/

# View dashboard
GET /api/v1/requisitions/dashboard/

# Amend (creates version snapshot, reopens as draft)
POST /api/v1/requisitions/<req_uuid>/amend/

# Compare versions
GET /api/v1/requisitions/<req_uuid>/diff/

# List encumbrances
GET /api/v1/requisitions/encumbrances/
```

---

## 6. Method Selection

### 6.1 Get Method Recommendation

```bash
# Get recommended method for a value
POST /api/v1/method-selection/recommendations/recommend/
{
  "value": 150000,
  "requisition_id": "<req_uuid>"
}
# Response: { "recommended_method": "simplified", ... }
```

### 6.2 Override Method (with justification)

```bash
# Override the recommended method
POST /api/v1/method-selection/overrides/
{
  "requisition": "<req_uuid>",
  "original_method": "simplified",
  "selected_method": "direct",
  "reason": "Emergency procurement for critical shortage"
}

# List methods
GET /api/v1/method-selection/methods/
```

### 6.3 Non-Open Justification

```bash
# Create non-open justification
POST /api/v1/method-selection/justifications/
{
  "requisition": "<req_uuid>",
  "method": "direct",
  "reason_code": "emergency",
  "reason_text": "Critical medicine stockout requiring immediate procurement",
  "supporting_evidence_url": "https://drive.google.com/doc/emergency-cert.pdf"
}

# List justifications
GET /api/v1/method-selection/justifications/

# Update justification status
PUT /api/v1/method-selection/justifications/<uuid:pk>/
{ "status": "zpc_approved" }
```

### 6.4 Preference Schemes

```bash
# List preference schemes
GET /api/v1/method-selection/preferences/

# Create preference scheme
POST /api/v1/method-selection/preferences/
{
  "scheme_name": "Citizen-Owned 12% Margin",
  "category": "citizen_owned",
  "margin_percentage": 12,
  "applies_to": "goods"
}
```

---

## 7. Supplier Registration

### 7.1 Create Application (Public - No Auth)

```bash
# Public registration - NO auth required
POST /api/v1/suppliers/applications/
{
  "company_name": "HealthPharma Ltd",
  "registration_number": "REG-2026-001",
  "tin": "TIN-1000001",
  "ceec_category": "citizen_owned",
  "email": "vendor@healthpharma.zm",
  "password": "Vendor@123",
  "contact_person": "John Banda",
  "contact_phone": "+260977100001",
  "contact_email": "john@healthpharma.zm",
  "address": "123 Cairo Road, Lusaka",
  "bank_name": "Zanaco",
  "bank_account_number": "1234567890",
  "bank_account_name": "HealthPharma Ltd",
  "bank_branch": "Cairo Road"
}
# Save application_uuid (status: "draft")
```

### 7.2 Wizard Step Updates

```bash
# Step 3: Update Contact Info
POST /api/v1/suppliers/applications/<app_uuid>/step/3/
{
  "contact_person": "John Banda",
  "contact_phone": "+260977100001",
  "contact_email": "john@healthpharma.zm",
  "address": "123 Cairo Road, Lusaka"
}

# Step 4: Update Bank Info
POST /api/v1/suppliers/applications/<app_uuid>/step/4/
{
  "bank_name": "Zanaco",
  "bank_account_number": "1234567890",
  "bank_account_name": "HealthPharma Ltd",
  "bank_branch": "Cairo Road"
}
```

### 7.3 Upload Documents

```bash
# Upload document (multipart form-data)
POST /api/v1/suppliers/applications/<app_uuid>/upload-document/
{
  "document_type": "tax_clearance",
  "file_path": "/uploads/tax_2026.pdf"
}
```

### 7.4 Submit Application

```bash
# Submit for review (status: draft → submitted)
POST /api/v1/suppliers/applications/<app_uuid>/submit/
```

### 7.5 PACRA Validation (Stub)

```bash
# Validate with PACRA
POST /api/v1/suppliers/validate-pacra/
{
  "tin": "TIN-1000001",
  "company_name": "HealthPharma Ltd"
}
# Response: { "valid": true, "message": "PACRA validation successful" }
```

### 7.6 CEEC Validation (Stub)

```bash
# Validate with CEEC
POST /api/v1/suppliers/validate-ceec/
{
  "certificate_number": "CEEC-2026-001",
  "ceec_category": "citizen_owned"
}
# Response: { "valid": true, "message": "CEEC validation successful" }
```

### 7.7 Review & Approve Application

```bash
# Login as Procurement Officer
POST /api/v1/auth/login/
{ "email": "po@zammsa.zm", "password": "Test@123" }

# Review application
POST /api/v1/suppliers/applications/<app_uuid>/review/
{ "decision": "approved" }
# → status: "approved"
# → Supplier record created
# → Supplier User auto-created with:
#     employee_id = "SUP-<reg_number>"
#     role = "supplier_user"

# Test: Reject application
POST /api/v1/suppliers/applications/<app_uuid>/review/
{
  "decision": "rejected",
  "rejection_reason": "Incomplete documentation"
}
```

### 7.8 Supplier Management

```bash
# Login as Supplier User
POST /api/v1/auth/login/
{
  "email": "vendor@healthpharma.zm",
  "password": "Vendor@123"
}

# List suppliers
GET /api/v1/suppliers/
# (authenticated users only)

# Get supplier detail
GET /api/v1/suppliers/<supplier_uuid>/

# Upload supplier document
POST /api/v1/suppliers/documents/
{
  "supplier": "<supplier_uuid>",
  "document_type": "business_registration",
  "file_path": "/uploads/cert_2026.pdf",
  "expiry_date": "2027-06-01"
}

# Suspend supplier (soft delete)
DELETE /api/v1/suppliers/<supplier_uuid>/
# → status: "suspended"
```

---

## 8. Solicitations (Tendering)

### 8.1 Create Solicitation

```bash
# Login as Procurement Officer
POST /api/v1/auth/login/
{ "email": "po@zammsa.zm", "password": "Test@123" }

# Create solicitation
POST /api/v1/solicitations/
{
  "requisition": "<req_uuid>",
  "title": "ITB - Pharmaceutical Supply Q1 2026",
  "description": "Supply of essential medicines",
  "method": "simplified",
  "estimated_value": 270000,
  "issue_date": "2026-02-01",
  "closing_date": "2026-03-01T10:00:00Z",
  "opening_date": "2026-03-01T10:30:00Z",
  "department": "<dept_uuid>"
}
# Save sol_uuid (status: "draft")
```

### 8.2 Add Evaluation Criteria

```bash
# Add criteria (total weight must = 100)
POST /api/v1/solicitations/criteria/
{
  "solicitation": "<sol_uuid>",
  "criterion_name": "Experience & Past Performance",
  "criterion_type": "technical",
  "weight": 30,
  "minimum_threshold": 50
}

POST /api/v1/solicitations/criteria/
{
  "solicitation": "<sol_uuid>",
  "criterion_name": "Technical Proposal Quality",
  "criterion_type": "technical",
  "weight": 40,
  "minimum_threshold": 60
}

POST /api/v1/solicitations/criteria/
{
  "solicitation": "<sol_uuid>",
  "criterion_name": "Price",
  "criterion_type": "financial",
  "weight": 30
}
```

### 8.3 Upload Solicitation Documents

```bash
POST /api/v1/solicitations/documents/
{
  "solicitation": "<sol_uuid>",
  "document_type": "bidding_document",
  "file_path": "/uploads/itb-2026-001.pdf",
  "is_public": true
}
```

### 8.4 Submit for Approval

```bash
# Submit solicitation (criteria weights must total 100%)
POST /api/v1/solicitations/<sol_uuid>/submit/
```

### 8.5 Approve Solicitation

```bash
# Login as Procurement Manager
POST /api/v1/auth/login/
{ "email": "pm@zammsa.zm", "password": "Test@123" }

# Approve
POST /api/v1/solicitations/<sol_uuid>/approve/
# → status: "approved"
```

### 8.6 Publish Solicitation

```bash
# Login as Procurement Officer
POST /api/v1/auth/login/
{ "email": "po@zammsa.zm", "password": "Test@123" }

# Publish
POST /api/v1/solicitations/<sol_uuid>/publish/
# → status: "published"
# → Closing date countdown starts
```

### 8.7 Issue Addendum

```bash
# Issue addendum
POST /api/v1/solicitations/<sol_uuid>/addendum/
{
  "description": "Amendment to delivery schedule",
  "reason": "Revised delivery timeline from supplier feedback",
  "extend_closing_days": 7
}
# Note: If ≤7 days to closing, extend_closing_days is REQUIRED
```

### 8.8 Clarifications

```bash
# Login as Supplier
POST /api/v1/auth/login/
{ "email": "vendor@healthpharma.zm", "password": "Vendor@123" }

# List addenda requiring acknowledgment
GET /api/v1/bids/addenda/<sol_uuid>/

# Ask clarification (must be logged in)
POST /api/v1/solicitations/clarifications/
{
  "solicitation": "<sol_uuid>",
  "question": "Are bids to be submitted in hard copy or electronic format?"
}

# Login as Procurement Officer to answer
POST /api/v1/auth/login/
{ "email": "po@zammsa.zm", "password": "Test@123" }

POST /api/v1/solicitations/clarifications/<clar_uuid>/answer/
{
  "answer": "Electronic submission via the e-GP portal only",
  "is_public": true
}
```

---

## 9. Bid Submission & Opening

### 9.1 Pre-Bid Conference

```bash
# Login as Procurement Officer
POST /api/v1/auth/login/
{ "email": "po@zammsa.zm", "password": "Test@123" }

# Schedule conference
POST /api/v1/bids/conferences/
{
  "solicitation": "<sol_uuid>",
  "scheduled_date": "2026-02-15T10:00:00Z",
  "location": "ZAMMSA Boardroom, Lusaka"
}
```

### 9.2 Supplier Bid Submission (9-Step Two-Envelope)

```bash
# Login as Supplier
POST /api/v1/auth/login/
{ "email": "vendor@healthpharma.zm", "password": "Vendor@123" }

# Submit bid (multipart form-data)
POST /api/v1/bids/submit/
{
  "solicitation_id": "<sol_uuid>",
  "bid_price": 250000,
  "validity_period_days": 90,
  "addenda_acknowledged": true
}
# Files: technical_proposal (PDF), financial_proposal (PDF, encrypted), bid_security (PDF, optional)
#
# Response: {
#   "submission_id": "...",
#   "receipt_number": "RCP-2026-00001",
#   "status": "submitted",
#   "financial_envelope_encrypted": true
# }

# Create second supplier for competitive bidding
POST /api/v1/users/create/
{
  "employee_id": "SUP-REG-002",
  "full_name": "MediSupply Zambia",
  "email": "vendor2@medisupply.zm",
  "password": "Vendor@123",
  "role": "supplier_user"
}
# Login as second supplier and submit bid similarly
POST /api/v1/bids/submit/
{
  "solicitation_id": "<sol_uuid>",
  "bid_price": 265000,
  "validity_period_days": 90,
  "addenda_acknowledged": true
}
```

### 9.3 Bid Opening

```bash
# Login as Procurement Officer
POST /api/v1/auth/login/
{ "email": "po@zammsa.zm", "password": "Test@123" }

# After closing_date passes, start opening session
POST /api/v1/bids/openings/start/<sol_uuid>/

# Open all bids at once (batch mode)
POST /api/v1/bids/openings/conduct/<sol_uuid>/

# OR open bids individually:
POST /api/v1/bids/openings/<opening_uuid>/open-bid/<bid_uuid>/
# → Response: reads technical publicly, financial remains sealed

# Generate opening minutes
GET /api/v1/bids/openings/<opening_uuid>/minutes/

# Send minutes to all bidders
POST /api/v1/bids/openings/<opening_uuid>/send-minutes/

# Public view of bid opening
GET /api/v1/bids/public/openings/<opening_uuid>/
```

---

## 10. Bid Evaluation

### 10.1 Form Evaluation Committee

```bash
# Login as Director of Procurement
POST /api/v1/auth/login/
{ "email": "dirproc@zammsa.zm", "password": "Test@123" }

# Create committee
POST /api/v1/evaluations/committees/
{
  "solicitation": "<sol_uuid>",
  "members": [
    {"user_id": "<ecchair_uuid>", "role": "chairperson"},
    {"user_id": "<ecm1_uuid>", "role": "member"}
  ],
  "chairperson": "<ecchair_uuid>",
  "secretary": "<ecm1_uuid>"
}
```

### 10.2 Declare Conflict of Interest

```bash
# Login as EC Member
POST /api/v1/auth/login/
{ "email": "ecm1@zammsa.zm", "password": "Test@123" }

# Declare COI
POST /api/v1/evaluations/committees/<committee_uuid>/declare-coi/
{
  "declaration": "I have no conflict of interest with any bidder",
  "has_conflict": false
}

# Test: COI with conflict (auto-recuses member)
POST /api/v1/evaluations/committees/<committee_uuid>/declare-coi/
{
  "declaration": "My brother works at HealthPharma Ltd",
  "has_conflict": true
}
# → member.recused = true (cannot score)
```

### 10.3 Preliminary Examination

```bash
# Submit preliminary exam results
POST /api/v1/evaluations/preliminary/
{
  "bid": "<bid_uuid>",
  "criterion": "mandatory_documentation",
  "is_compliant": true,
  "comment": "All documents submitted"
}
```

### 10.4 Technical Scoring (Blind Evaluation)

```bash
# Login as EC Member
POST /api/v1/auth/login/
{ "email": "ecm1@zammsa.zm", "password": "Test@123" }

# Score individual criterion for a bid
POST /api/v1/evaluations/technical-scores/submit/
{
  "bid_id": "<bid_uuid>",
  "criterion_id": "<criterion_uuid>",
  "raw_score": 75,
  "comment": "Adequate experience"
}

# View MY scores (others hidden until all submit)
GET /api/v1/evaluations/technical-scores/my/<bid_uuid>/

# Login as EC Chair and score
POST /api/v1/auth/login/
{ "email": "ecchair@zammsa.zm", "password": "Test@123" }
POST /api/v1/evaluations/technical-scores/submit/
{
  "bid_id": "<bid_uuid>",
  "criterion_id": "<criterion_uuid>",
  "raw_score": 80,
  "comment": "Strong technical proposal"
}

# After ALL members score → calculate averages
POST /api/v1/evaluations/technical-scores/averages/<bid_uuid>/

# Check threshold (default 70%)
POST /api/v1/evaluations/technical-scores/threshold-check/<bid_uuid>/
# Response: { "passed": true, "average_score": 77.5 }
```

### 10.5 Financial Evaluation

```bash
# EC Chair authorizes opening financial envelopes
POST /api/v1/evaluations/financial/authorize-open/<sol_uuid>/

# View bids that passed technical
GET /api/v1/evaluations/financial/passed-bids/<sol_uuid>/

# Calculate financial evaluation for a bid
POST /api/v1/evaluations/financial/calculate/<bid_uuid>/
# Response: { "evaluated_price": 250000, "financial_score": 94.34, "preference_applied": null }
```

### 10.6 Combined Score (QCBS)

```bash
# Calculate QCBS for full evaluation
POST /api/v1/evaluations/qcbs/<sol_uuid>/
# Response: [{"rank":1, "bid_id":"...", "total_score":85.5}, ...]

# Select award winner
POST /api/v1/evaluations/award/<sol_uuid>/
{ "bid_id": "<winning_bid_uuid>" }
```

### 10.7 Bid Evaluation Report (BER)

```bash
# EC Chair generates BER
POST /api/v1/evaluations/reports/generate/<sol_uuid>/
# Save ber_uuid

# View signatures status
GET /api/v1/evaluations/reports/<ber_uuid>/signatures/

# Members sign BER
POST /api/v1/evaluations/reports/<ber_uuid>/sign/

# Chair submits BER to ZPC (all signatures required)
POST /api/v1/evaluations/reports/<ber_uuid>/submit/
# → status: "submitted"

# ZPC approves
POST /api/v1/auth/login/
{ "email": "zpc@zammsa.zm", "password": "Test@123" }
POST /api/v1/evaluations/reports/<ber_uuid>/approve/
# → status: "approved"

# Test: ZPC rejects
POST /api/v1/evaluations/reports/<ber_uuid>/reject/
{ "rejection_reason": "Insufficient price justification" }
```

### 10.8 Post-Qualification

```bash
POST /api/v1/evaluations/post-qualifications/
{
  "ber": "<ber_uuid>",
  "bidder": "<winning_bidder_id>",
  "verification_items": [
    {"item": "Tax clearance", "status": "verified"},
    {"item": "Business registration", "status": "verified"}
  ]
}
```

---

## 11. Contracts

### 11.1 Create Contract

```bash
# Login as Procurement Officer
POST /api/v1/auth/login/
{ "email": "po@zammsa.zm", "password": "Test@123" }

# Create contract
POST /api/v1/contracts/
{
  "solicitation": "<sol_uuid>",
  "winning_bid": "<bid_uuid>",
  "ber": "<ber_uuid>",
  "supplier": "<supplier_uuid>",
  "title": "Pharmaceutical Supply Contract Q1 2026",
  "contract_type": "po",
  "value": 250000,
  "currency": "ZMW",
  "start_date": "2026-04-01",
  "end_date": "2026-09-30"
}
# Save contract_uuid (status: "draft")
```

### 11.2 Publish Award Notice

```bash
# Publish award (starts 10-day waiting period)
POST /api/v1/contracts/<contract_uuid>/publish-award/
# → waiting_period_start set, countdown begins
```

### 11.3 Supplier Signs Contract

```bash
# Login as Supplier
POST /api/v1/auth/login/
{ "email": "vendor@healthpharma.zm", "password": "Vendor@123" }

# Sign contract
POST /api/v1/contracts/<contract_uuid>/sign-supplier/
# → status: "pending_acceptance"
```

### 11.4 Director General Countersigns

```bash
# Login as Director General
POST /api/v1/auth/login/
{ "email": "dg@zammsa.zm", "password": "Test@123" }

# Countersign
POST /api/v1/contracts/<contract_uuid>/countersign/
# → If value > 1,000,000: performance_security_required = true
# → Else: contract can proceed to activate
```

### 11.5 Upload & Validate Security (if required)

```bash
# Login as Supplier
POST /api/v1/auth/login/
{ "email": "vendor@healthpharma.zm", "password": "Vendor@123" }

# Upload performance security
POST /api/v1/contracts/<contract_uuid>/upload-security/
{
  "security_type": "performance",
  "amount": 25000,
  "issuing_bank": "Zanaco",
  "reference_number": "BG-2026-001",
  "expiry_date": "2026-12-31"
}
# Save security_uuid

# Login as Finance Officer to validate
POST /api/v1/auth/login/
{ "email": "fo@zammsa.zm", "password": "Test@123" }

POST /api/v1/contracts/<contract_uuid>/validate-security/<security_uuid>/
# → If valid: contract status → "active"
```

### 11.6 Assign Contract Manager & Milestones

```bash
POST /api/v1/contracts/<contract_uuid>/assign-manager/
{
  "contract_manager_id": "<cm_uuid>",
  "milestones": [
    {"name": "Initial Delivery", "due_date": "2026-05-15"},
    {"name": "Final Delivery", "due_date": "2026-08-30"},
    {"name": "Inspection & Acceptance", "due_date": "2026-09-15"}
  ]
}
```

### 11.7 File & Resolve Appeal (Disappointed Bidder)

```bash
# Login as losing supplier
POST /api/v1/auth/login/
{ "email": "vendor2@medisupply.zm", "password": "Vendor@123" }

POST /api/v1/contracts/<contract_uuid>/file-appeal/
{
  "grounds": "Our bid was lower and technically compliant",
  "supporting_docs": [{"url": "https://drive.google.com/eval-comparison.pdf"}]
}
# → contract.appeal_pending = true

# Login as Director of Procurement to resolve
POST /api/v1/auth/login/
{ "email": "dirproc@zammsa.zm", "password": "Test@123" }

POST /api/v1/contracts/<contract_uuid>/resolve-appeal/<appeal_uuid>/
{
  "resolution": "dismissed",
  "notes": "Appeal lacks merit; winning bidder scored higher technically"
}
```

### 11.8 Activate Contract (After Waiting Period)

```bash
# Activate if waiting period elapsed and no appeal pending
POST /api/v1/contracts/<contract_uuid>/activate/
# → status: "active"
```

### 11.9 Contract Amendments

```bash
# Create amendment
POST /api/v1/contracts/<contract_uuid>/amend/
{
  "reason": "Price escalation due to currency fluctuation",
  "description": "Increase unit price by 10%",
  "financial_impact": 25000,
  "legal_opinion_ref": null
}
# Note: If variation_percentage > 25%, legal_opinion_ref is required

# Approve amendment (ZPC)
POST /api/v1/contracts/<contract_uuid>/amendments/<amendment_uuid>/approve/

# Sign amendment
POST /api/v1/contracts/<contract_uuid>/amendments/<amendment_uuid>/sign/
```

### 11.10 Liquidated Damages

```bash
# Calculate LD
POST /api/v1/contracts/<contract_uuid>/calculate-ld/
{
  "days_delayed": 15,
  "daily_rate": 1500
}
# Note: applied_amount = min(calculated_amount, contract_value * 10%)
```

### 11.11 Closure Checklist

```bash
# Complete closure checklist
POST /api/v1/contracts/<contract_uuid>/closure-checklist/
{
  "all_deliverables_received": true,
  "final_inspection_passed": true,
  "all_payments_processed": true,
  "performance_security_released": true,
  "snagging_items_resolved": true,
  "staff_warranty_training_done": true,
  "as_built_docs_received": true
}
# → When ALL true: status → "completed"
```

### 11.12 Terminate Contract

```bash
POST /api/v1/contracts/terminations/
{
  "contract": "<contract_uuid>",
  "termination_type": "mutual",
  "effective_date": "2026-08-01",
  "reason": "Mutual agreement to terminate",
  "legal_review_ref": "LEGAL-2026-005"
}
```

### 11.13 Archive Contract

```bash
POST /api/v1/contracts/<contract_uuid>/archive/
# → status: "archived", retention_expiry: 7 years
```

---

## 12. Finance

### 12.1 Budget Allocations

```bash
# Login as Finance Officer
POST /api/v1/auth/login/
{ "email": "fo@zammsa.zm", "password": "Test@123" }

# Create budget allocation
POST /api/v1/finance/budget-allocations/
{
  "entity_level": "department",
  "entity_code": "DEPT-HLTH",
  "entity_name": "Health Programmes",
  "fiscal_year": "<fy_uuid>",
  "allocated_amount": 5000000,
  "encumbered_amount": 0,
  "expended_amount": 0
}

# Sync from ERP (batch)
POST /api/v1/finance/budget-allocations/sync-from-erp/
{
  "allocations": [
    {
      "entity_code": "DEPT-HLTH",
      "fiscal_year": "<fy_uuid>",
      "allocated_amount": 5000000,
      "source": "ERP-2026-001"
    }
  ]
}

# View budget summary
GET /api/v1/finance/budget-allocations/summary/

# View available budget (property field)
GET /api/v1/finance/budget-allocations/<uuid:pk>/
# → includes available = allocated - encumbered - expended

# Encumber budget (manual)
POST /api/v1/finance/budget-allocations/<uuid:pk>/encumber/
{ "amount": 270000, "requisition": "<req_uuid>" }

# Release encumbrance
POST /api/v1/finance/budget-allocations/<uuid:pk>/release/
```

### 12.2 Goods Receipt Note (GRN)

```bash
# GRN via webhook (from WMS/ERP)
POST /api/v1/finance/grn-webhook/
{
  "grn_number": "GRN-2026-001",
  "po_number": "<po_number>",
  "item_description": "Paracetamol 500mg x 1000 packs",
  "quantity_received": 1000,
  "unit_price": 150,
  "total_amount": 150000,
  "received_by": "Warehouse Clerk"
}
```

### 12.3 Invoice Management

```bash
# Create invoice
POST /api/v1/finance/invoices/
{
  "contract": "<contract_uuid>",
  "po_number": "<contract.contract_number>",
  "grn": "<grn_uuid>",
  "supplier": "<supplier_uuid>",
  "invoice_number": "INV-2026-001",
  "amount": 150000,
  "due_date": "2026-05-30",
  "status": "submitted"
}
# Save invoice_uuid

# Submit invoice
POST /api/v1/finance/invoices/<invoice_uuid>/submit/

# 3-Way Match (PO ↔ GRN ↔ Invoice)
POST /api/v1/finance/invoices/<invoice_uuid>/match/
{
  "po_quantity": 1000,
  "grn_quantity": 1000,
  "invoice_quantity": 1000,
  "po_price": 150,
  "invoice_price": 150
}
# Response: { "match_status": "complete" }

# Test: Mismatch
POST /api/v1/finance/invoices/<invoice_uuid>/match/
{
  "po_quantity": 1000,
  "grn_quantity": 800,
  "invoice_quantity": 1000,
  "po_price": 150,
  "invoice_price": 155
}
# Response: { "match_status": "partial" or "no_match", "discrepancies": {...} }

# Approve invoice (role based on amount)
POST /api/v1/finance/invoices/<invoice_uuid>/approve/
# Rules:
#   ≤ 100K → finance_officer
#   100K-500K → department_head
#   > 500K → director_general

# Reject invoice
POST /api/v1/finance/invoices/<invoice_uuid>/reject/
{ "reason": "Quantity mismatch with GRN" }
```

### 12.4 Payments

```bash
# Process payment
POST /api/v1/finance/invoices/<invoice_uuid>/pay/
{
  "payment_method": "electronic",
  "amount": 150000
}
# → Payment record created

# Bank confirmation
POST /api/v1/finance/invoices/<invoice_uuid>/bank-confirm/
{ "confirmed": true, "bank_reference": "SWIFT-ZM-2026-001" }

# Send payment advice to supplier
POST /api/v1/finance/invoices/<invoice_uuid>/send-advice/

# Post expenditure to ERP GL
POST /api/v1/finance/invoices/<invoice_uuid>/post-erp/
```

### 12.5 Letters of Credit

```bash
# Create LC
POST /api/v1/finance/letters-of-credit/
{
  "contract": "<contract_uuid>",
  "lc_number": "LC-2026-001",
  "loc_type": "sight",
  "amount": 250000,
  "issuing_bank": "Bank of Zambia",
  "beneficiary": "HealthPharma Ltd",
  "expiry_date": "2026-12-31"
}

# Record LC drawdown
POST /api/v1/finance/letters-of-credit/<lc_uuid>/drawdown/
{ "amount": 100000 }
```

---

## 13. Supplier Performance Management

### 13.1 Evaluate Supplier

```bash
# Login as Contract Manager
POST /api/v1/auth/login/
{ "email": "cm@zammsa.zm", "password": "Test@123" }

# Evaluate performance
POST /api/v1/suppliers/performances/evaluate/<supplier_uuid>/
{
  "contract": "<contract_uuid>",
  "metrics": {
    "delivery_timeliness": 80,
    "quality": 90,
    "compliance": 85,
    "responsiveness": 75
  },
  "overall_score": 82.5,
  "improvement_notes": "Good performance, minor delays on last delivery"
}
# Note: If overall_score < 60: needs_improvement = true
```

### 13.2 View Performance Data

```bash
# List performance records
GET /api/v1/suppliers/performances/

# Check which suppliers need improvement (score < 60)
GET /api/v1/suppliers/performances/improvement/

# View suppliers due for evaluation (no eval in last 180 days)
GET /api/v1/suppliers/performances/reminder/

# View risk scores
GET /api/v1/suppliers/risk-scores/
```

### 13.3 Blacklist

```bash
# Add to blacklist
POST /api/v1/suppliers/blacklist/
{
  "supplier": "<supplier_uuid>",
  "reason": "Fraudulent documentation",
  "debarred_until": "2028-12-31"
}

# View blacklist
GET /api/v1/suppliers/blacklist/
```

---

## 14. Reporting & Dashboards

### 14.1 Dashboards

```bash
# Login as any authenticated user
POST /api/v1/auth/login/
{ "email": "dg@zammsa.zm", "password": "Test@123" }

# Executive Dashboard (Director General)
GET /api/v1/reporting/dashboards/executive/
# Response: {
#   "total_value": 5000000,
#   "total_procurements": 25,
#   "avg_processing_days": 45,
#   "completion_rate": 72.5,
#   "active_procurements": 18,
#   "by_method": [...],
#   "by_department": [...],
#   "by_status": [...],
#   "by_supplier_category": [...]
# }

# Procurement Dashboard (Procurement Manager)
GET /api/v1/reporting/dashboards/procurement/
# Response: {
#   "by_status": [...],
#   "average_processing_days": 45,
#   "max_processing_days": 90,
#   "by_method": [...],
#   "by_supplier_category": [...],
#   "by_department": [...]
# }

# Financial Dashboard
GET /api/v1/reporting/dashboards/financial/
```

### 14.2 Data Warehouse

```bash
# View warehouse data
GET /api/v1/reporting/warehouse/

# Run ETL manually (management command)
# python manage.py run_etl
```

### 14.3 Report Generation

```bash
# Generate quarterly report (Excel)
GET /api/v1/reporting/reports/generate/quarterly/
# Response: XLSX file download

# Generate direct bidding report
GET /api/v1/reporting/reports/generate/direct_bidding/

# Generate ZPPA quarterly report (Excel with totals)
GET /api/v1/reporting/reports/generate/zppa_quarterly/

# Generate contract amendments report
GET /api/v1/reporting/reports/generate/contract_amendments/
```

### 14.4 ZPPA XML Export & Submission

```bash
# Export ZPPA-compliant XML
GET /api/v1/reporting/reports/zppa-xml/
# Response: XML file download (ZPPA schema format)

# Submit report to ZPPA
POST /api/v1/reporting/reports/zppa-submit/
{
  "report_id": "<report_def_uuid>",
  "generation_id": "<gen_uuid>"
}
# Response: {
#   "status": "submitted",
#   "zppa_reference": "ZPPA-20260509-...",
#   "submitted_at": "..."
# }

# View ZPPA submissions
GET /api/v1/reporting/zppa-submissions/

# View submission detail
GET /api/v1/reporting/zppa-submissions/<sub_uuid>/
```

### 14.5 Archive Management

```bash
# Add file to archive
POST /api/v1/reporting/archives/add/
{
  "procurement_id": "CNT-2026-001",
  "file_path": "/archives/cnt-2026-001.pdf",
  "size_bytes": 2048000,
  "retention_expiry": "2033-01-01"
}

# Toggle legal hold (prevents auto-deletion)
POST /api/v1/reporting/archives/<archive_uuid>/legal-hold/

# Check expiry alerts (default 90 days)
GET /api/v1/reporting/archives/expiry-alerts/?days=90
```

### 14.6 ETL & Scheduled Tasks

```bash
# Seed Celery Beat schedules
# python manage.py seed_reporting_schedules
#
# Creates:
#   - ETL Data Warehouse - Daily 2 AM (cron: 0 2 * * *)
#   - Generate Quarterly Report - 1st of Month (cron: 0 6 1 * *)
```

---

## 15. Public Portal

### 15.1 Public Statistics (No Auth Required)

```bash
GET /api/v1/public/stats/
# Response: { "total_tenders": 50, "active_tenders": 12, ... }
```

### 15.2 Public Tenders

```bash
# List published tenders
GET /api/v1/public/tenders/

# View tender detail
GET /api/v1/public/tenders/<sol_uuid>/

# Track view count
POST /api/v1/public/tenders/<sol_uuid>/track-view/

# Download tender document
GET /api/v1/public/tenders/<sol_uuid>/documents/<doc_uuid>/download/
```

### 15.3 News

```bash
# List published news
GET /api/v1/public/news/

# View news detail
GET /api/v1/public/news/<news_uuid>/

# Track view
POST /api/v1/public/news/<news_uuid>/track-view/
```

### 15.4 Notices & Events

```bash
# List notices
GET /api/v1/public/notices/

# List events (optional filter: ?type=upcoming)
GET /api/v1/public/events/

# View FAQs
GET /api/v1/public/faqs/
```

### 15.5 Contact

```bash
# Submit contact message
POST /api/v1/public/contact/
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Procurement inquiry",
  "message": "How do I register as a supplier?"
}
```

---

## 16. Integrations

### 16.1 Integration Endpoints

```bash
# Login as Integration Manager
POST /api/v1/auth/login/
{ "email": "admin@zammsa.zm", "password": "Test@123" }

# Create endpoint
POST /api/v1/integrations/endpoints/
{
  "system_name": "ERP-SAP",
  "endpoint_url": "https://erp.zammsa.zm/api/budget",
  "auth_type": "api_key",
  "auth_config": {"api_key": "sk-encrypted-..."},
  "timeout_seconds": 30,
  "retry_count": 3,
  "is_enabled": true
}
```

### 16.2 Budget Validation Call

```bash
# Call ERP budget validation
POST /api/v1/integrations/budget-validation/
{
  "endpoint_id": "<endpoint_uuid>",
  "requisition_id": "<req_uuid>",
  "amount": 270000
}
# → Uses exponential backoff: min(2^attempt * 1, 30) seconds
```

### 16.3 WMS Webhook

```bash
# Incoming WMS webhook
POST /api/v1/integrations/webhooks/wms/
{
  "po_number": "CNT-2026-001",
  "received_quantity": 950
}
```

### 16.4 View Logs

```bash
# View integration logs
GET /api/v1/integrations/logs/

# View sync status
GET /api/v1/integrations/sync-status/

# View webhook deliveries
GET /api/v1/integrations/webhooks/
```

---

## Business Rules Summary

| Rule | Threshold | Enforcement |
|------|-----------|-------------|
| DG Approval | ≤ K250,000 | Workflow routing |
| ZPC Approval | > K250,000 | Workflow routing |
| Contract Amendment Cap | 25% cumulative | System block + legal review |
| Liquidated Damages Cap | 10% of contract value | System calculation |
| Preference Margin (Citizen-Owned) | 12% | Financial evaluation |
| Preference Margin (Citizen-Empowered) | 8% | Financial evaluation |
| Preference Margin (Citizen-Influenced) | 4% | Financial evaluation |
| Domestic Goods Margin | 15% | Financial evaluation |
| Bid Security (Goods/Works) | 2-5% | Validation |
| Bid Security (Consulting) | 1-2% | Validation |
| Performance Security | 5-10% (for >K1M) | Required before contract active |
| Advance Payment | Max 25% | Requires guarantee |
| Retention Amount | 5-10% | Withheld, released on completion |
| Waiting Period | 10 working days | System enforced |
| Document Retention | 7 years | Auto-archiving + expiry alerts |
| Session Timeout | 30 minutes | Automatic logout |
| Password Expiry | 90 days | Force change |
| Account Lockout | 5 failed attempts | 30 minute lock |

---

## Role Responsibility Matrix

| Role | Requisition | Solicitation | Bidding | Evaluation | Contract | Payment |
|------|------------|-------------|---------|------------|----------|---------|
| User Dept Staff | Create | - | - | - | - | - |
| Department Head | Approve | - | - | - | - | - |
| Procurement Officer | - | Create, Publish | Open Bids | Prepare BER | Generate | - |
| Procurement Manager | - | Approve | - | - | Approve Amend | - |
| Finance Officer | Validate Budget | - | - | - | - | Approve ≤100K |
| Budget Controller | - | - | - | - | - | - |
| EC Member | - | - | - | Score | - | - |
| EC Chair | - | - | - | Consolidate, Gen BER | - | - |
| ZPC Member | Approve >250K | - | - | Approve BER | Approve Amend | - |
| Director of Procurement | - | - | - | Form Committee | Approve Amend | - |
| Director General | Approve ≤250K | - | - | - | Sign Contract | Approve >500K |
| Contract Manager | - | - | - | - | Manage | - |
| Supplier | - | - | Submit Bid | - | Sign | Submit Invoice |
| System Admin | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access |
| Auditor | View Only | View Only | View Only | View Only | View Only | View Only |
