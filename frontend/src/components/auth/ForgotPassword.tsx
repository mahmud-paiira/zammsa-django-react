import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { LoadingSpinner } from '../common/LoadingSpinner';

const schema = z.object({
  email: z.string().email('Valid email required'),
});

type Form = z.infer<typeof schema>;

const ForgotPassword: React.FC = () => {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch {
      // error handled by interceptor
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-zammsa-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 mb-6">
            If an account with that email exists, we've sent a password reset link.
          </p>
          <Link to="/login" className="text-zammsa-green hover:underline text-sm">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zammsa-green">Reset Password</h1>
          <p className="text-gray-500 mt-2">
            Enter your email and we'll send you a reset link
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-zammsa-green focus:border-zammsa-green"
              placeholder="you@example.gov.zm"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-zammsa-green text-white rounded-lg hover:bg-zammsa-green-dark disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Send Reset Link
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link to="/login" className="text-sm text-zammsa-green hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
