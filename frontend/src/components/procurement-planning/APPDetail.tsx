import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { procurementPlanningApi } from '../../api/procurement_planning';
import { AnnualProcurementPlan } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmModal } from '../common/ConfirmModal';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const APPDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState<AnnualProcurementPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [reason, setReason] = useState('');
  const [consolidateTarget, setConsolidateTarget] = useState('');

  const loadAPP = async () => {
    if (!id) return;
    setLoading(true);
    try { setApp(await procurementPlanningApi.detail(id)); } catch { setApp(null); }
    setLoading(false);
  };

  useEffect(() => { loadAPP(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const doAction = async (action: string, data?: any) => {
    setActionLoading(action);
    try {
      let res: any;
      switch (action) {
        case 'submit':
          res = await procurementPlanningApi.submit(id!);
          break;
        case 'approve':
          res = await procurementPlanningApi.approve(id!, data);
          toast.success(res.message);
          if (res.gpn) toast.success('GPN auto-generated');
          break;
        case 'reject':
          res = await procurementPlanningApi.reject(id!, data.reason);
          break;
        case 'return':
          res = await procurementPlanningApi.returnForRevision(id!, data.reason);
          break;
        case 'compliance':
          res = await procurementPlanningApi.complianceCheck(id!, data);
          break;
        case 'consolidate':
          res = await procurementPlanningApi.consolidate(id!, data.consolidate_into, data.notes);
          break;
        case 'publish':
          res = await procurementPlanningApi.publishAPP(id!);
          break;
        case 'generate-gpn':
          res = await procurementPlanningApi.generateGPN(id!);
          break;
      }
      toast.success(res?.message || `${action} successful`);
      setShowReturnModal(false);
      setShowRejectModal(false);
      setShowConsolidateModal(false);
      setShowComplianceModal(false);
      setShowPublishModal(false);
      setReason('');
      setConsolidateTarget('');
      loadAPP();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || `${action} failed`);
    }
    setActionLoading('');
  };

  const role = user?.role || '';
  const status = app?.status || '';

  const canSubmit = status === 'draft' && ['user_dept_staff', 'department_head'].includes(role);
  const canApprove =
    (status === 'dept_head_review' && role === 'department_head') ||
    (status === 'procurement_review' && ['director_procurement', 'director_general', 'system_admin'].includes(role)) ||
    (status === 'director_review' && role === 'director_procurement') ||
    (status === 'zpc_review' && ['zpc_member', 'director_general'].includes(role));
  const canRejectReturn = (status === 'dept_head_review' && role === 'department_head') ||
    (status === 'procurement_review' && ['procurement_officer', 'procurement_manager', 'director_procurement', 'system_admin'].includes(role)) ||
    (status === 'director_review' && role === 'director_procurement') ||
    (status === 'zpc_review' && ['zpc_member', 'director_general'].includes(role));
  const canCompliance = status === 'procurement_review' && ['procurement_officer', 'procurement_manager', 'director_procurement', 'system_admin'].includes(role);
  const canConsolidate = status === 'procurement_review' && ['procurement_officer', 'procurement_manager', 'director_procurement', 'system_admin'].includes(role);
  const canPublish = status === 'approved' && ['procurement_officer', 'procurement_manager', 'system_admin'].includes(role);
  const canGenerateGPN = ['approved', 'published'].includes(status);

  if (loading) return <div className="p-12"><LoadingSpinner size="lg" /></div>;
  if (!app) return <div className="p-12 text-center text-gray-500">APP not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">APP Detail</h1>
            <StatusBadge status={status} />
            {app.is_consolidated && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Consolidated</span>}
          </div>
          <p className="text-sm text-gray-500">{app.department_name} — FY {app.fiscal_year_code}</p>
        </div>
        <button onClick={() => navigate('/procurement-planning')} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to List</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Total Estimated Value</p>
          <p className="text-xl font-bold">ZMW {Number(app.total_estimated_value).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Submitted By</p>
          <p className="text-sm font-medium">{app.submitted_by_name || '-'}</p>
          {app.submitted_at && <p className="text-xs text-gray-400">{new Date(app.submitted_at).toLocaleString()}</p>}
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Approved By</p>
          <p className="text-sm font-medium">{app.approved_by_name || '-'}</p>
          {app.approved_at && <p className="text-xs text-gray-400">{new Date(app.approved_at).toLocaleString()}</p>}
        </div>
      </div>

      {app.rejection_reason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">Rejection Reason</p>
          <p className="text-sm text-red-600">{app.rejection_reason}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Line Items ({app.line_items?.length || 0})</h2>
          <span className="text-sm text-gray-500">Total: ZMW {Number(app.total_estimated_value).toLocaleString()}</span>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Value (ZMW)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Method</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Issue Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Award Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {app.line_items?.map((item) => (
              <tr key={item.line_item_id}>
                <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">{Number(item.estimated_value).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.recommended_method?.replace(/_/g, ' ') || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.planned_issue_date || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.planned_award_date || '-'}</td>
              </tr>
            ))}
            {(!app.line_items || app.line_items.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No line items</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {app.approval_trail && app.approval_trail.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Approval Trail</h2>
          <div className="space-y-2">
            {app.approval_trail.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-zammsa-green flex-shrink-0" />
                <div>
                  <span className="font-medium capitalize">{entry.action}</span>
                  <span className="text-gray-500"> by {entry.user_name} ({entry.role.replace(/_/g, ' ')})</span>
                  <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</p>
                  {entry.details?.reason && <p className="text-xs text-gray-500">Reason: {entry.details.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Actions</h2>
        <div className="flex flex-wrap gap-2">
          {canSubmit && (
            <button onClick={() => doAction('submit')} disabled={actionLoading === 'submit'} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {actionLoading === 'submit' ? 'Submitting...' : 'Submit for Dept Head Review'}
            </button>
          )}
          {canApprove && (
            <button onClick={() => status === 'zpc_review' ? doAction('approve', { zpc_minutes: '', zpc_resolution_number: '' }) : doAction('approve')}
              disabled={actionLoading === 'approve'} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
              {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
            </button>
          )}
          {canRejectReturn && (
            <>
              <button onClick={() => setShowReturnModal(true)} className="px-4 py-2 border border-yellow-400 text-yellow-700 rounded-lg text-sm hover:bg-yellow-50">
                Return for Revision
              </button>
              <button onClick={() => setShowRejectModal(true)} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50">
                Reject
              </button>
            </>
          )}
          {canCompliance && (
            <button onClick={() => setShowComplianceModal(true)} className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm hover:bg-blue-50">
              Compliance Check
            </button>
          )}
          {canConsolidate && (
            <button onClick={() => setShowConsolidateModal(true)} className="px-4 py-2 border border-purple-300 text-purple-600 rounded-lg text-sm hover:bg-purple-50">
              Consolidate
            </button>
          )}
          {canGenerateGPN && (
            <button onClick={() => doAction('generate-gpn')} disabled={actionLoading === 'generate-gpn'} className="px-4 py-2 border border-teal-300 text-teal-600 rounded-lg text-sm hover:bg-teal-50">
              {actionLoading === 'generate-gpn' ? 'Generating...' : 'Generate GPN'}
            </button>
          )}
          {canPublish && (
            <button onClick={() => setShowPublishModal(true)} className="px-4 py-2 bg-zammsa-green text-white rounded-lg text-sm hover:bg-zammsa-green-dark">
              Publish APP
            </button>
          )}
        </div>
      </div>

      <ConfirmModal open={showReturnModal} onClose={() => setShowReturnModal(false)} onConfirm={() => doAction('return', { reason })} title="Return for Revision" message="Provide a reason for returning this APP to draft." confirmText="Return" variant="warning" loading={actionLoading === 'return'} />
      <ConfirmModal open={showRejectModal} onClose={() => setShowRejectModal(false)} onConfirm={() => doAction('reject', { reason })} title="Reject APP" message="Provide a reason for rejection." confirmText="Reject" variant="danger" loading={actionLoading === 'reject'} />

      {showReturnModal || showRejectModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium">{showReturnModal ? 'Return for Revision' : 'Reject APP'}</h3>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Enter reason..." className="w-full mt-3 border border-gray-300 rounded-md p-2 text-sm" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowReturnModal(false); setShowRejectModal(false); setReason(''); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={() => doAction(showReturnModal ? 'return' : 'reject', { reason })}
                disabled={!reason || actionLoading !== ''} className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${showReturnModal ? 'bg-yellow-600' : 'bg-red-600'}`}>
                {actionLoading ? 'Processing...' : showReturnModal ? 'Return' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showComplianceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium">Compliance Check</h3>
            <div className="mt-3 space-y-3">
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Compliance notes..." className="w-full border border-gray-300 rounded-md p-2 text-sm" />
              <div className="flex gap-2">
                <button onClick={() => doAction('compliance', { compliance_status: 'compliant', notes: reason })} disabled={actionLoading !== ''} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50">
                  Mark Compliant
                </button>
                <button onClick={() => doAction('compliance', { compliance_status: 'non_compliant', notes: reason })} disabled={actionLoading !== '' || !reason} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50">
                  Mark Non-Compliant
                </button>
                <button onClick={() => setShowComplianceModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConsolidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium">Consolidate APP</h3>
            <p className="text-sm text-gray-500 mt-1">Move all line items into another APP</p>
            <input value={consolidateTarget} onChange={(e) => setConsolidateTarget(e.target.value)} placeholder="Target APP ID (UUID)" className="w-full mt-3 border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Consolidation notes (optional)" className="w-full mt-2 border border-gray-300 rounded-md p-2 text-sm" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowConsolidateModal(false); setConsolidateTarget(''); setReason(''); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={() => doAction('consolidate', { consolidate_into: consolidateTarget, notes: reason })} disabled={!consolidateTarget || actionLoading !== ''} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50">
                {actionLoading ? 'Consolidating...' : 'Consolidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium">Publish APP</h3>
            <p className="text-sm text-gray-500 mt-1">This will make the APP publicly visible</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowPublishModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={() => doAction('publish')} disabled={actionLoading !== ''} className="px-4 py-2 bg-zammsa-green text-white rounded-lg text-sm disabled:opacity-50">
                {actionLoading ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APPDetail;
