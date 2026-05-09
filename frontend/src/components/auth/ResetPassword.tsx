import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { LoadingSpinner } from '../common/LoadingSpinner';

const schema = z.object({
  new_password: z.string().min(8, 'At least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type Form = z.infer<typeof schema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      await authApi.resetPassword({
        token,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      toast.success('Password reset successful. Please login.');
      navigate('/login');
    } catch {
      // error handled by interceptor
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zammsa-green">Set New Password</h1>
          <p className="text-gray-500 mt-2">Enter your new password</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              {...register('new_password')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-zammsa-green focus:border-zammsa-green"
            />
            {errors.new_password && <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              {...register('confirm_password')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-zammsa-green focus:border-zammsa-green"
            />
            {errors.confirm_password && <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-zammsa-green text-white rounded-lg hover:bg-zammsa-green-dark disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
