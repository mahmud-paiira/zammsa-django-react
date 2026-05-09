import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementPlanningApi, methodApi, masterDataApi, MasterDepartment, MasterFiscalYear } from '../../api/procurement_planning';
import { APPLineItem } from '../../types';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../common/LoadingSpinner';

const APPCreate: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<MasterDepartment[]>([]);
  const [fiscalYears, setFiscalYears] = useState<MasterFiscalYear[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [form, setForm] = useState({
    fiscal_year_id: '',
    department_id: '',
  });
  const [items, setItems] = useState<Partial<APPLineItem>[]>([
    { description: '', estimated_value: 0, planned_issue_date: '', planned_award_date: '' },
  ]);

  useEffect(() => {
    Promise.all([
      masterDataApi.departments({ is_active: true, page_size: 200 }),
      masterDataApi.fiscalYears({ page_size: 50 }),
    ]).then(([deptRes, fyRes]) => {
      setDepartments(deptRes.results);
      const fys = fyRes.results;
      setFiscalYears(fys);
      const current = fys.find((fy) => fy.is_current);
      if (current) setForm((prev) => ({ ...prev, fiscal_year_id: current.fiscal_year_id }));
    }).catch(() => toast.error('Failed to load master data')).finally(() => setLoadingMeta(false));
  }, []);

  const addItem = () => setItems([...items, { description: '', estimated_value: 0, planned_issue_date: '', planned_award_date: '' }]);

  const removeItem = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };

  const updateItem = (i: number, field: string, value: any) => {
    const updated = [...items];
    (updated[i] as any)[field] = value;
    if (field === 'estimated_value' && Number(value) > 0) {
      methodApi.recommend({ estimated_value: Number(value) }).then((res) => {
        updated[i].recommended_method = res.recommended_method;
        setItems([...updated]);
      }).catch(() => {});
    }
    setItems(updated);
  };

  const createLineItem = async (appId: string, item: Partial<APPLineItem>) => {
    await procurementPlanningApi.lineItems.create({
      app: appId,
      description: item.description,
      estimated_value: item.estimated_value,
      planned_issue_date: item.planned_issue_date || undefined,
      planned_award_date: item.planned_award_date || undefined,
    });
  };

  const handleSubmit = async () => {
    if (!form.department_id) { toast.error('Department is required'); return; }
    if (!form.fiscal_year_id) { toast.error('Fiscal year is required'); return; }
    if (!items[0].description) { toast.error('At least one line item is required'); return; }
    setSubmitting(true);
    try {
      const app = await procurementPlanningApi.create({
        fiscal_year: form.fiscal_year_id,
        department: form.department_id,
      });
      for (const item of items) {
        if (item.description) await createLineItem(app.app_id, item);
      }
      toast.success('APP created successfully');
      navigate(`/procurement-planning/${app.app_id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create APP');
    }
    setSubmitting(false);
  };

  const total = items.reduce((s, i) => s + Number(i.estimated_value || 0), 0);

  if (loadingMeta) return <div className="p-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Annual Procurement Plan</h1>
        <p className="text-sm text-gray-500">Enter departmental procurement needs for the fiscal year</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
            <select value={form.fiscal_year_id} onChange={(e) => setForm({ ...form, fiscal_year_id: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Select fiscal year...</option>
              {fiscalYears.map((fy) => (
                <option key={fy.fiscal_year_id} value={fy.fiscal_year_id}>
                  {fy.year_code}{fy.is_current ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Select department...</option>
              {departments.map((d) => (
                <option key={d.dept_id} value={d.dept_id}>
                  {d.dept_name} ({d.dept_code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
          <button onClick={addItem} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">+ Add Item</button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Item {i + 1}</span>
              {items.length > 1 && (
                <button onClick={() => removeItem(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Describe the procurement need" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Estimated Value (ZMW)</label>
                <input type="number" min="0" value={item.estimated_value || ''} onChange={(e) => updateItem(i, 'estimated_value', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Planned Issue Date</label>
                <input type="date" value={item.planned_issue_date || ''} onChange={(e) => updateItem(i, 'planned_issue_date', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Planned Award Date</label>
                <input type="date" value={item.planned_award_date || ''} onChange={(e) => updateItem(i, 'planned_award_date', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            {item.recommended_method && (
              <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded">
                Recommended method: <strong>{item.recommended_method.replace(/_/g, ' ')}</strong>
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <p className="text-lg font-bold">Total: ZMW {total.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate('/procurement-planning')} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-zammsa-green text-white rounded-lg hover:bg-zammsa-green-dark text-sm font-medium disabled:opacity-50 flex items-center gap-2">
          {submitting && <LoadingSpinner size="sm" />}
          Create APP
        </button>
      </div>
    </div>
  );
};

export default APPCreate;
