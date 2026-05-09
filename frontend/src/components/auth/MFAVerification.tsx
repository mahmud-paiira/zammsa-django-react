import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { LoadingSpinner } from '../common/LoadingSpinner';

const schema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

type Form = z.infer<typeof schema>;

interface Props {
  email: string;
  onBack: () => void;
}

const MFAVerification: React.FC<Props> = ({ email, onBack }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setError('');
    try {
      const res = await authApi.mfaLogin(email, data.code);
      localStorage.setItem('access_token', res.access);
      localStorage.setItem('refresh_token', res.refresh);
      const { store } = await import('../../store');
      const { setUser } = await import('../../store/authSlice');
      store.dispatch(setUser(res.user));
      toast.success('Verified successfully');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zammsa-green">Two-Factor Auth</h1>
          <p className="text-gray-500 mt-2">
            Enter the code from your authenticator app
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('code')}
              maxLength={6}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-zammsa-green focus:border-zammsa-green text-center text-2xl tracking-widest"
              placeholder="000000"
              autoFocus
            />
            {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-zammsa-green text-white rounded-lg hover:bg-zammsa-green-dark disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Verify
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
};

export default MFAVerification;
