# ZAMMSA e-Procurement — Workflow Fixes Summary

## Core Bug Fix: APP Status Transitions

**Before (BROKEN):** Every role-to-status transition was off-by-one. A single `submit` endpoint conflated submitting and approving. Draft was submitted by `department_head` instead of `user_dept_staff`, and every subsequent stage had the same inverted mapping.

**After (CORRECT):** Separate `submit` and `approve` endpoints with accurate role mapping:

| Step | Action | Role | Endpoint | Status Change |
|---|---|---|---|---|
| 2 | Submit draft | `user_dept_staff` | `POST .../submit/` | `draft` → `dept_head_review` |
| 4 | Approve | `department_head` | `POST .../approve/` | `dept_head_review` → `procurement_review` |
| 5 | Compliance check | `procurement_officer` | `POST .../compliance/` | sets notes, can reject → draft |
| 5 | Consolidate | `procurement_officer` | `POST .../consolidate/` | marks consolidated into target APP |
| 5 | Approve | `procurement_officer` | `POST .../approve/` | `procurement_review` → `director_review` |
| 6 | Approve | `director_procurement` | `POST .../approve/` | `director_review` → `zpc_review` |
| 7 | Approve | `zpc_member` / `director_general` | `POST .../approve/` | `zpc_review` → `approved` |
| 9 | Publish APP | anyone | `POST .../publish/` | `approved` → `published` |

---

## All Fixes Applied

### 1. ERP Budget Sync
- **New endpoint:** `POST /api/v1/finance/budget-allocations/sync-from-erp/`
- Restricted to `finance_officer`, `budget_controller`, `integration_manager`, `system_admin`
- Accepts array of `{entity_code, fiscal_year, allocated_amount, ...}` payloads
- Added fields: `last_synced_at`, `entity_name`, `raw_data`, `sync_source` to `BudgetAllocation`
- **Files:** `finance/models.py`, `finance/views.py`, `finance/urls.py`

### 2. Role-Restricted APP Creation
- `perform_create` validates user role against `('user_dept_staff', 'department_head', 'procurement_officer', 'system_admin')`
- Raises `PermissionDenied` with descriptive message
- **File:** `procurement_planning/views.py`

### 3. Budget Validation on Submit
- `_check_budget_availability()` compares line item `estimated_value` against `BudgetAllocation.available`
- Returns detailed warnings per item: `{item_id, description, value, available, shortfall}`
- Blocks submission if any line item exceeds budget
- **File:** `procurement_planning/views.py`

### 4. Dynamic Method Recommendation
- Queries `ThresholdRule` (from `system_config`) filtered by `applies_to='procurement'` and `is_active=True`, ordered by `min_value`
- Falls back to hardcoded thresholds if no rules configured
- Auto-set on `APPLineItem` create/update via `perform_create`/`perform_update`
- **Files:** `method_selection/views.py`, `procurement_planning/views.py`

### 5. Compliance Check
- **New endpoint:** `POST .../annual-plans/<pk>/compliance/`
- Only `procurement_officer`, `procurement_manager`, `director_procurement`, `system_admin`
- If `compliance_status='non_compliant'`, returns APP to draft with reason
- Sets `compliance_notes` on the APP
- **Files:** `procurement_planning/views.py`, `procurement_planning/urls.py`

### 6. Consolidation
- **New endpoint:** `POST .../annual-plans/<pk>/consolidate/`
- Moves all line items from source APP to target APP
- Recalculates `total_estimated_value` on target APP
- Marks source APP with `is_consolidated=True` and `consolidated_into` FK
- Restricted to procurement roles during `procurement_review` stage
- **Files:** `procurement_planning/views.py`, `procurement_planning/urls.py`

### 7. Auto-GPN Generation
- `_auto_generate_gpn()` called automatically when APP reaches `approved` status
- Populates `content` JSON with fiscal year, department, line item details
- Manual trigger also available: `POST .../annual-plans/<pk>/generate-gpn/`
- Deduplicates — won't create duplicate GPNs for same APP
- **Files:** `procurement_planning/views.py`, `procurement_planning/urls.py`

### 8. Multi-Channel GPN Publication
- Added `publication_targets` JSONField to `GeneralProcurementNotice`
- Validates targets against: `website`, `e_gp_portal`, `government_gazette`
- Accepts `proof_urls` array on publish
- Records `published_at` and `published_by`
- **New endpoint:** `POST .../notices/<pk>/archive/`
- **Files:** `procurement_planning/models.py`, `procurement_planning/views.py`

### 9. Rejection with Reason
- Added `rejection_reason` (TextField), `rejected_by` (FK), `rejected_at` fields to APP model
- Reject endpoint now requires `reason` in request body
- **New endpoint:** `POST .../annual-plans/<pk>/return/` — returns to draft with reason
- **Files:** `procurement_planning/models.py`, `procurement_planning/views.py`

### 10. Approval Trail (Audit Log)
- Added `approval_trail` JSONField to `AnnualProcurementPlan`
- Each action records: `{action, role, user_id, user_name, timestamp, details}`
- Viewable via `GET .../annual-plans/<pk>/approval-trail/`
- **Files:** `procurement_planning/models.py`, `procurement_planning/views.py`, `procurement_planning/urls.py`

### 11. Frontend-Ready Pagination
- Consistent response format across all paginated views:

```json
{
  "count": 150,
  "page": 1,
  "page_size": 25,
  "total_pages": 6,
  "next": "...?page=2",
  "previous": null,
  "results": [...]
}
```

- Updated in: `procurement_planning`, `finance`, `method_selection`, `system_config`
- **Files:** `*/views.py` StandardPagination classes

---

## New Endpoints Added

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/finance/budget-allocations/sync-from-erp/` | ERP budget import |
| GET | `/api/v1/finance/budget-allocations/summary/` | Budget aggregate summary |
| POST | `/api/v1/procurement-planning/annual-plans/<pk>/approve/` | Approve at current workflow stage |
| POST | `/api/v1/procurement-planning/annual-plans/<pk>/return/` | Return APP to draft for revision |
| POST | `/api/v1/procurement-planning/annual-plans/<pk>/compliance/` | Compliance check (procurement officer) |
| POST | `/api/v1/procurement-planning/annual-plans/<pk>/consolidate/` | Consolidate APP into another |
| GET | `/api/v1/procurement-planning/annual-plans/<pk>/approval-trail/` | Full approval audit history |
| POST | `/api/v1/procurement-planning/annual-plans/<pk>/generate-gpn/` | Manual GPN generation |
| GET | `/api/v1/procurement-planning/line-items/<pk>/` | Line item detail |
| POST | `/api/v1/procurement-planning/notices/<pk>/archive/` | Archive a GPN |

---

## Database Migrations Created

- `finance.0003_budgetallocation_entity_name_and_more` — 4 new fields + unique_together update
- `procurement_planning.0003_annualprocurementplan_approval_trail_and_more` — 10 new fields across 2 models
