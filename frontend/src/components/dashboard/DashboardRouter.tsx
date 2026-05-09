import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useRedux';

const ProcurementDashboard = React.lazy(() => import('./ProcurementDashboard'));
const FinanceDashboard = React.lazy(() => import('./FinanceDashboard'));
const DepartmentHeadDashboard = React.lazy(() => import('./DepartmentHeadDashboard'));
const DirectorGeneralDashboard = React.lazy(() => import('./DirectorGeneralDashboard'));
const ZPCDashboard = React.lazy(() => import('./ZPCDashboard'));
const EvaluationDashboard = React.lazy(() => import('./EvaluationDashboard'));
const ContractManagerDashboard = React.lazy(() => import('./ContractManagerDashboard'));
const AuditorDashboard = React.lazy(() => import('./AuditorDashboard'));

const roleDashboard: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  procurement_officer: ProcurementDashboard,
  procurement_manager: ProcurementDashboard,
  director_procurement: ProcurementDashboard,
  finance: FinanceDashboard,
  finance_officer: FinanceDashboard,
  budget_controller: FinanceDashboard,
  department_head: DepartmentHeadDashboard,
  user_dept_staff: DepartmentHeadDashboard,
  director_general: DirectorGeneralDashboard,
  zpc: ZPCDashboard,
  zpc_officer: ZPCDashboard,
  zpc_member: ZPCDashboard,
  evaluator: EvaluationDashboard,
  evaluation_chair: EvaluationDashboard,
  evaluation_committee_member: EvaluationDashboard,
  evaluation_committee_chair: EvaluationDashboard,
  contract_manager: ContractManagerDashboard,
  supplier_relationship_manager: ContractManagerDashboard,
  auditor: AuditorDashboard,
  super_auditor: AuditorDashboard,
  zppa_reporting_officer: ProcurementDashboard,
  integration_manager: ProcurementDashboard,
};

const DashboardRouter: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading user information...</p>
      </div>
    );
  }

  const role = user.role;
  const DashboardComponent = roleDashboard[role];

  if (!DashboardComponent) {
    if (['system_admin', 'admin', 'super_admin'].includes(role)) {
      return <Navigate to="/admin" replace />;
    }
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No dashboard configured for role: {role}</p>
      </div>
    );
  }

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zammsa-green" />
        </div>
      }
    >
      <DashboardComponent />
    </React.Suspense>
  );
};

export default DashboardRouter;
