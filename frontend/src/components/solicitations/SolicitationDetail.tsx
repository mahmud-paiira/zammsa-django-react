import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitationsApi } from '../../api/solicitations';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const WORKFLOW_STEPS = [
  { label: 'Draft', statuses: ['draft'] },
  { label: 'Pending Approval', statuses: ['pending_approval', 'approved', 'published', 'closed', 'awarded'] },
  { label: 'Approved', statuses: ['approved', 'published', 'closed', 'awarded'] },
  { label: 'Published', statuses: ['published', 'closed', 'awarded'] },
  { label: 'Closed / Awarded', statuses: ['closed', 'awarded'] },
];

const SolicitationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [addendumDesc, setAddendumDesc] = useState('');
  const [addendumReason, setAddendumReason] = useState('');
  const [addendumExtend, setAddendumExtend] = useState('');
  const [showAddendumForm, setShowAddendumForm] = useState(false);

  const { data: sol, isLoading } = useQuery({
    queryKey: ['solicitation', id],
    queryFn: () => solicitationsApi.get(id!),
    enabled: !!id,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['solicitation', id] });

  const submitMutation = useMutation({
    mutationFn: () => solicitationsApi.submit(id!),
    onSuccess: (res) => { invalidate(); toast.success(res.message || 'Submitted for approval'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Submit failed'),
  });

  const approveMutation = useMutation({
    mutationFn: () => solicitationsApi.approve(id!),
    onSuccess: (res) => { invalidate(); toast.success(res.message || 'Approved'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Approval failed'),
  });

  const publishMutation = useMutation({
    mutationFn: () => solicitationsApi.publish(id!),
    onSuccess: (res) => { invalidate(); toast.success(res.message || 'Published'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Publish failed'),
  });

  const closeMutation = useMutation({
    mutationFn: () => solicitationsApi.close(id!),
    onSuccess: () => { invalidate(); toast.success('Solicitation closed'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Close failed'),
  });

  const addendumMutation = useMutation({
    mutationFn: (data: Record<string, any>) => solicitationsApi.addAddendum(id!, data),
    onSuccess: (res) => { invalidate(); setAddendumDesc(''); setAddendumReason(''); setAddendumExtend(''); setShowAddendumForm(false); toast.success(res.message || 'Addendum issued'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Addendum failed'),
  });

  const clarificationMutation = useMutation({
    mutationFn: (q: string) => solicitationsApi.submitClarification(id!, { question: q }),
    onSuccess: () => { setComment(''); invalidate(); toast.success('Question submitted'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Question failed'),
  });

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (!sol) return <p className="text-center text-gray-500 py-12">Solicitation not found</p>;

  const role = user?.role || '';
  const status = sol.status || '';

  const canSubmit = status === 'draft' && ['procurement_officer', 'procurement_manager'].includes(role);
  const canApprove = status === 'pending_approval' && ['procurement_manager', 'director_procurement'].includes(role);
  const canPublish = status === 'approved' && ['procurement_manager', 'director_procurement'].includes(role);
  const canClose = status === 'published' && ['procurement_manager', 'procurement_officer'].includes(role);
  const canAddAddendum = ['published', 'pending_approval', 'approved'].includes(status) && ['procurement_manager', 'procurement_officer'].includes(role);

  const showActions = canSubmit || canApprove || canPublish || canClose || canAddAddendum;

  const handleAddAddendum = () => {
    const data: Record<string, any> = { description: addendumDesc, reason: addendumReason };
    if (addendumExtend) data.extend_closing_days = parseInt(addendumExtend, 10);
    addendumMutation.mutate(data);
  };

  const handleClarify = () => {
    if (comment) clarificationMutation.mutate(comment);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{sol.title}</h1>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">{sol.type?.toUpperCase()}</span>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {sol.sol_number} &middot; {sol.department_name || sol.department}
          </p>
        </div>
        <div className="flex gap-2">
          {canSubmit && <button onClick={() => submitMutation.mutate()} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit for Approval</button>}
          {(status === 'draft') && <Link to={`/solicitations/${id}/edit`} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Edit</Link>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Procurement Method</dt><dd className="font-medium">{sol.procurement_method?.replace(/_/g, ' ')}</dd></div>
              <div><dt className="text-gray-500">Estimated Value</dt><dd className="font-medium">{sol.estimated_value?.toLocaleString()} {sol.currency}</dd></div>
              <div><dt className="text-gray-500">Budget Code</dt><dd className="font-medium">{sol.budget_code || '-'}</dd></div>
              <div><dt className="text-gray-500">Issue Date</dt><dd className="font-medium">{sol.issue_date ? new Date(sol.issue_date).toLocaleDateString() : '-'}</dd></div>
              <div><dt className="text-gray-500">Closing Date</dt><dd className="font-medium">{sol.closing_date ? new Date(sol.closing_date).toLocaleString() : '-'}</dd></div>
              <div><dt className="text-gray-500">Opening Date</dt><dd className="font-medium">{sol.opening_date ? new Date(sol.opening_date).toLocaleString() : '-'}</dd></div>
              {sol.published_at && <div><dt className="text-gray-500">Published At</dt><dd className="font-medium">{new Date(sol.published_at).toLocaleString()}</dd></div>}
            </dl>
            {sol.description && <p className="mt-4 text-sm text-gray-700">{sol.description}</p>}
          </div>

          {sol.evaluation_criteria && sol.evaluation_criteria.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Criteria</h2>
              <div className="space-y-2">
                {sol.evaluation_criteria.map((c: any) => (
                  <div key={c.criterion_id || c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{c.criterion_name}</span>
                      <span className="ml-2 text-xs text-gray-500 uppercase">({c.criterion_type})</span>
                    </div>
                    <span className="font-semibold text-zammsa-green">{c.weight}%</span>
                  </div>
                ))}
                <p className="text-xs text-gray-500 text-right">Total: {sol.evaluation_criteria.reduce((s: number, c: any) => s + Number(c.weight), 0)}%</p>
              </div>
            </div>
          )}

          {sol.clarification_responses?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Clarifications</h2>
              <div className="space-y-3">
                {sol.clarification_responses.map((c: any) => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Q: {c.question}</p>
                    {c.answer ? (
                      <p className="text-sm text-gray-600 mt-1">A: {c.answer}</p>
                    ) : (
                      <p className="text-xs text-yellow-600 mt-1">Awaiting answer</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{new Date(c.asked_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sol.document_sets?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-2">
                {sol.document_sets.map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm text-gray-900">{doc.filename}</span>
                    <button className="ml-auto text-sm text-zammsa-green hover:underline">Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflow</h2>
            <div className="space-y-3 text-sm">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${step.statuses.includes(status) ? 'bg-green-500' : status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <span className={step.statuses.includes(status) ? 'text-gray-900 font-medium' : 'text-gray-400'}>{step.label}</span>
                </div>
              ))}
            </div>
            {status === 'cancelled' && <p className="mt-3 text-xs text-red-600">This solicitation has been cancelled.</p>}
          </div>

          {showActions && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {canSubmit && <button onClick={() => submitMutation.mutate()} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Submit for Approval</button>}
                {canApprove && <button onClick={() => approveMutation.mutate()} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Approve</button>}
                {canPublish && <button onClick={() => publishMutation.mutate()} className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">Publish</button>}
                {canClose && <button onClick={() => closeMutation.mutate()} className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">Close</button>}
                {canAddAddendum && !showAddendumForm && (
                  <button onClick={() => setShowAddendumForm(true)} className="w-full px-4 py-2 border border-amber-400 text-amber-700 rounded-lg text-sm hover:bg-amber-50">Issue Addendum</button>
                )}
              </div>
            </div>
          )}

          {showAddendumForm && canAddAddendum && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">New Addendum</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
                  <textarea rows={2} value={addendumDesc} onChange={(e) => setAddendumDesc(e.target.value)} className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                  <input type="text" value={addendumReason} onChange={(e) => setAddendumReason(e.target.value)} className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Extend Closing (days)</label>
                  <input type="number" min={1} value={addendumExtend} onChange={(e) => setAddendumExtend(e.target.value)} className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddAddendum} disabled={!addendumDesc || addendumMutation.isPending} className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50">Issue</button>
                  <button onClick={() => setShowAddendumForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {sol.addenda && sol.addenda.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Addenda</h2>
              <div className="space-y-2">
                {sol.addenda.map((a: any) => (
                  <div key={a.id || a.addendum_id} className="text-sm">
                    <p className="font-medium text-gray-900">Addendum #{a.number || a.addendum_number}</p>
                    <p className="text-gray-600">{a.description}</p>
                    {a.extended_closing_date && <p className="text-xs text-amber-600">Extended to {new Date(a.extended_closing_date).toLocaleString()}</p>}
                    <p className="text-xs text-gray-400">{new Date(a.created_at || a.issued_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ask a Question</h2>
            <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter your question..." className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button onClick={handleClarify} disabled={!comment || clarificationMutation.isPending} className="mt-2 w-full px-4 py-2 bg-zammsa-green text-white rounded-lg text-sm hover:bg-zammsa-green-dark disabled:opacity-50">Submit Question</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitationDetail;
