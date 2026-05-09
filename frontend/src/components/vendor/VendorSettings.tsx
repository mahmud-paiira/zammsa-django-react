import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { vendorApi } from '../../api/vendor';
import { LoadingSpinner } from '../common/LoadingSpinner';

const passwordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8, 'At least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] });

type PasswordForm = z.infer<typeof passwordSchema>;

const VendorSettings: React.FC = () => {
  const [tab, setTab] = useState<'password' | 'notifications' | 'mfa'>('password');
  const [mfaStep, setMfaStep] = useState<'setup' | 'verify' | 'done'>('setup');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQrCode, setMfaQrCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const [notifications, setNotifications] = useState({
    bid_deadlines: true,
    tender_updates: true,
    contract_alerts: true,
    payment_confirmations: true,
    system_updates: false,
  });

  const onChangePassword = async (data: PasswordForm) => {
    try {
      await vendorApi.settings.changePassword(data);
      toast.success('Password changed successfully');
      reset();
    } catch { /* handled by interceptor */ }
  };

  const onSaveNotifications = async () => {
    try {
      await vendorApi.settings.updateNotificationPreferences(notifications);
      toast.success('Notification preferences updated');
    } catch { /* handled by interceptor */ }
  };

  const setupMFA = async () => {
    try {
      const res = await vendorApi.settings.setupMFA();
      setMfaSecret(res.secret);
      setMfaQrCode(res.qr_code);
      setMfaStep('verify');
    } catch { /* handled by interceptor */ }
  };

  const verifyMFA = async () => {
    try {
      await vendorApi.settings.verifyMFA(mfaCode);
      setMfaStep('done');
      toast.success('Two-factor authentication enabled');
    } catch { /* handled by interceptor */ }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(['password', 'notifications', 'mfa'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-md transition-colors ${tab === t ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'password' ? 'Password' : t === 'notifications' ? 'Notifications' : 'Two-Factor Auth'}
          </button>
        ))}
      </div>

      {tab === 'password' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" {...register('current_password')} className="w-full border-gray-300 rounded-lg" />
              {errors.current_password && <p className="text-xs text-red-600 mt-1">{errors.current_password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" {...register('new_password')} className="w-full border-gray-300 rounded-lg" />
              {errors.new_password && <p className="text-xs text-red-600 mt-1">{errors.new_password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" {...register('confirm_password')} className="w-full border-gray-300 rounded-lg" />
              {errors.confirm_password && <p className="text-xs text-red-600 mt-1">{errors.confirm_password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-zammsa-green text-white rounded-lg text-sm hover:bg-zammsa-green-dark disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <LoadingSpinner size="sm" />}
              Change Password
            </button>
          </form>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                <button
                  type="button"
                  onClick={() => setNotifications((prev) => ({ ...prev, [key]: !value }))}
                  className={`w-10 h-6 rounded-full transition-colors ${value ? 'bg-zammsa-green' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </label>
            ))}
          </div>
          <button onClick={onSaveNotifications} className="mt-6 px-6 py-2 bg-zammsa-green text-white rounded-lg text-sm hover:bg-zammsa-green-dark">Save Preferences</button>
        </div>
      )}

      {tab === 'mfa' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Two-Factor Authentication</h2>
          {mfaStep === 'setup' && (
            <div>
              <p className="text-sm text-gray-500 mb-6">Add an extra layer of security to your account by enabling two-factor authentication.</p>
              <button onClick={setupMFA} className="px-6 py-2 bg-zammsa-green text-white rounded-lg text-sm hover:bg-zammsa-green-dark">Enable 2FA</button>
            </div>
          )}
          {mfaStep === 'verify' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Scan the QR code with your authenticator app or enter the secret key manually.</p>
              {mfaQrCode && (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                  <img src={mfaQrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-sm text-gray-500">Secret: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{mfaSecret}</code></p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-digit code from authenticator</label>
                <div className="flex gap-2">
                  <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} maxLength={6} className="w-32 border-gray-300 rounded-lg text-center text-lg tracking-widest" placeholder="000000" />
                  <button onClick={verifyMFA} className="px-4 py-2 bg-zammsa-green text-white rounded-lg text-sm">Verify</button>
                </div>
              </div>
            </div>
          )}
          {mfaStep === 'done' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">2FA Enabled</h3>
              <p className="text-sm text-gray-500 mt-2">Your account is now protected with two-factor authentication.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorSettings;
