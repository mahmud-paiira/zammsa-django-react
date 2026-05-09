import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchEvaluationDashboard, saveEvaluationScore, submitEvaluation, openFinancialEnvelopes, generateBER, signBER } from '../../api/dashboards';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAppSelector } from '../../hooks/useRedux';

const EvaluationDashboard: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const queryClient = useQueryClient();
  const [pollInterval] = useState(30000);
  const [activeTab, setActiveTab] = useState<'scoring' | 'chair'>('scoring');
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [comments, setComments] = useState<Record<string, Record<string, string>>>({});
  const [showSign, setShowSign] = useState(false);
  const [signPassword, setSignPassword] = useState('');
  const [signId, setSignId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['evaluationDashboard'],
    queryFn: fetchEvaluationDashboard,
    refetchInterval: pollInterval,
  });

  const saveMut = useMutation({
    mutationFn: ({ id, data: d }: { id: string; data: any }) => saveEvaluationScore(id, d),
    onSuccess: () => { toast.success('Scores saved as draft'); },
    onError: (err: any) => toast.error(err?.message || 'Save failed'),
  });

  const submitMut = useMutation({
    mutationFn: (id: string) => submitEvaluation(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['evaluationDashboard'] }); toast.success('Evaluation submitted'); },
    onError: (err: any) => toast.error(err?.message || 'Submission failed'),
  });

  const openFinMut = useMutation({
    mutationFn: (id: string) => openFinancialEnvelopes(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['evaluationDashboard'] }); toast.success('Financial envelopes opened'); },
    onError: (err: any) => toast.error(err?.message || 'Failed to open envelopes'),
  });

  const genBERMut = useMutation({
    mutationFn: (id: string) => generateBER(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['evaluationDashboard'] }); toast.success('BER generated'); },
    onError: (err: any) => toast.error(err?.message || 'BER generation failed'),
  });

  const signBERMut = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => signBER(id, password),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['evaluationDashboard'] }); toast.success('BER signed successfully'); setShowSign(false); setSignPassword(''); setSignId(null); },
    onError: (err: any) => toast.error(err?.message || 'Signing failed'),
  });

  if (isLoading) return <LoadingSpinner />;

  const isChair = user?.role === 'evaluation_chair';

  const handleScoreChange = (criteriaIdx: number, bidder: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [criteriaIdx]: { ...(prev[criteriaIdx] || {}), [bidder]: value },
    }));
  };

  const handleCommentChange = (criteriaIdx: number, bidder: string, value: string) => {
    setComments((prev) => ({
      ...prev,
      [criteriaIdx]: { ...(prev[criteriaIdx] || {}), [bidder]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluation Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.full_name}</p>
        </div>
        <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow">Auto-refreshing every 30s</span>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Assignments</h2>
        {data?.assignments && data.assignments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.assignments.map((a) => (
              <div key={a.id} className="border border-gray-200 rounded-lg p-4 hover:border-zammsa-green transition-colors">
                <p className="font-medium text-gray-900 text-sm">{a.solicitation}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{a.role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.status === 'completed' ? 'bg-green-100 text-green-700' :
                    a.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>{a.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Deadline: {new Date(a.deadline).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-400 text-sm text-center py-8">No assignments</p>}
      </div>

      {/* Tabs */}
      {isChair && (
        <div className="flex gap-2 border-b border-gray-200">
          <button onClick={() => setActiveTab('scoring')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'scoring' ? 'border-zammsa-green text-zammsa-green' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Scoring</button>
          <button onClick={() => setActiveTab('chair')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'chair' ? 'border-zammsa-green text-zammsa-green' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Chair View</button>
        </div>
      )}

      {/* Scoring Matrix */}
      {(!isChair || activeTab === 'scoring') && (
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scoring Matrix</h2>
          {data?.scoring_matrix && data.scoring_matrix.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Criteria</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">Weight</th>
                    {data.scoring_matrix[0]?.scores.map((s) => (
                      <React.Fragment key={s.bidder}>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">{s.bidder} Score</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">{s.bidder} Comment</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.scoring_matrix.map((c, ci) => (
                    <tr key={c.criteria} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.criteria}</td>
                      <td className="px-4 py-3 text-center">{c.weight}%</td>
                      {c.scores.map((s) => (
                        <React.Fragment key={s.bidder}>
                          <td className="px-4 py-3">
                            <input
                              type="number" min={0} max={100}
                              value={scores[ci]?.[s.bidder] ?? s.score}
                              onChange={(e) => handleScoreChange(ci, s.bidder, Number(e.target.value))}
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-center text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={comments[ci]?.[s.bidder] ?? s.comment}
                              onChange={(e) => handleCommentChange(ci, s.bidder, e.target.value)}
                              className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Comment..."
                            />
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No scoring matrix</p>}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => {
                const firstId = data?.assignments[0]?.id;
                if (firstId) saveMut.mutate({ id: firstId, data: { scores, comments } });
              }}
              disabled={saveMut.isPending}
              className="px-4 py-2 bg-zammsa-green text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >Save Draft</button>
            <button
              onClick={() => {
                const firstId = data?.assignments[0]?.id;
                if (firstId) {
                  saveMut.mutate({ id: firstId, data: { scores, comments, submit: true } });
                  submitMut.mutate(firstId);
                }
              }}
              disabled={submitMut.isPending}
              className="px-4 py-2 bg-zammsa-orange text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >Submit Final</button>
          </div>
        </div>
      )}

      {/* Chair View */}
      {isChair && activeTab === 'chair' && (
        <div className="space-y-6">
          {/* Score Consolidation */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Score Consolidation</h2>
            {data?.scoring_matrix && data.scoring_matrix.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Bidder</th>
                      {data.scoring_matrix.map((c) => (
                        <th key={c.criteria} className="px-4 py-3 text-center font-medium text-gray-500">{c.criteria}</th>
                      ))}
                      <th className="px-4 py-3 text-center font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.scoring_matrix[0]?.scores.map((s) => {
                      const total = data.scoring_matrix.reduce((sum, c) => {
                        const sc = c.scores.find((x) => x.bidder === s.bidder);
                        return sum + (sc?.score || 0) * (c.weight / 100);
                      }, 0);
                      return (
                        <tr key={s.bidder} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{s.bidder}</td>
                          {data.scoring_matrix.map((c) => {
                            const sc = c.scores.find((x) => x.bidder === s.bidder);
                            return <td key={c.criteria} className="px-4 py-3 text-center">{sc?.score ?? '-'}</td>;
                          })}
                          <td className="px-4 py-3 text-center font-bold text-zammsa-green">{total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-gray-400 text-sm text-center py-8">No scores yet</p>}
          </div>

          {/* Committee Info & Actions */}
          {data?.chair_data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Committee</h2>
                <p className="text-sm text-gray-600 mb-2">Members:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {data.chair_data.members.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => openFinMut.mutate(data.assignments[0]?.id || '')}
                    disabled={data.chair_data.financial_envelopes_opened || openFinMut.isPending}
                    className={`w-full px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                      data.chair_data.financial_envelopes_opened
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {data.chair_data.financial_envelopes_opened ? 'Financial Envelopes Opened' : 'Open Financial Envelopes'}
                  </button>

                  <button
                    onClick={() => genBERMut.mutate(data.assignments[0]?.id || '')}
                    disabled={data.chair_data.ber_generated || genBERMut.isPending}
                    className={`w-full px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                      data.chair_data.ber_generated
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {data.chair_data.ber_generated ? 'BER Generated' : 'Generate BER'}
                  </button>

                  <button
                    onClick={() => { setSignId(data.assignments[0]?.id || ''); setShowSign(true); }}
                    disabled={!data.chair_data.ber_generated || data.chair_data.ber_signed}
                    className={`w-full px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                      !data.chair_data.ber_generated || data.chair_data.ber_signed
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-zammsa-green text-white hover:bg-green-700'
                    }`}
                  >
                    {data.chair_data.ber_signed ? 'BER Signed' : 'Sign BER'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showSign && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Sign BER</h3>
            <p className="text-sm text-gray-500 mt-2">Enter your password to digitally sign the Bid Evaluation Report:</p>
            <input
              type="password"
              value={signPassword}
              onChange={(e) => setSignPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-3"
              placeholder="Enter password..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowSign(false); setSignPassword(''); setSignId(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => signId && signBERMut.mutate({ id: signId, password: signPassword })} disabled={signBERMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700 disabled:opacity-50">{signBERMut.isPending ? 'Processing...' : 'Sign'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationDashboard;
