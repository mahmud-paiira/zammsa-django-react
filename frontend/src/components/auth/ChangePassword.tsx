import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      navigate('/dashboard');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-zammsa-green rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your current and new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" value={form.old_password} onChange={(e) => setForm({ ...form, old_password: e.target.value })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
          </div>
          <button type="submit" disabled={mutation.isPending} className="w-full py-2 bg-zammsa-green text-white rounded-lg font-medium hover:bg-zammsa-green-dark disabled:opacity-50">
            {mutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
