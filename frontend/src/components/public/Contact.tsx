import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import publicApi from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type Form = z.infer<typeof schema>;

const Contact: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      await publicApi.submitContact(data);
      toast.success('Message sent successfully. We will get back to you soon.');
      reset();
    } catch {
      // error handled by interceptor
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
        <p className="text-gray-500 mt-2">Get in touch with ZAMMSA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input {...register('name')} className="w-full border-gray-300 rounded-lg focus:ring-zammsa-green focus:border-zammsa-green" />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input {...register('email')} className="w-full border-gray-300 rounded-lg focus:ring-zammsa-green focus:border-zammsa-green" />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input {...register('subject')} className="w-full border-gray-300 rounded-lg focus:ring-zammsa-green focus:border-zammsa-green" />
                {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea {...register('message')} rows={5} className="w-full border-gray-300 rounded-lg focus:ring-zammsa-green focus:border-zammsa-green" />
                {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-zammsa-green text-white rounded-lg hover:bg-zammsa-green-dark disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <LoadingSpinner size="sm" />}
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zammsa-green bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-zammsa-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-500 mt-0.5">Plot 12345, Great East Road<br />Lusaka, Zambia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zammsa-green bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-zammsa-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-gray-500 mt-0.5">+260 211 123 456</p>
                  <p className="text-gray-500">+260 211 123 457</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zammsa-green bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-zammsa-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-500 mt-0.5">info@zammsa.gov.zm</p>
                  <p className="text-gray-500">procurement@zammsa.gov.zm</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zammsa-green bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-zammsa-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Working Hours</p>
                  <p className="text-gray-500 mt-0.5">Monday - Friday: 08:00 - 17:00</p>
                  <p className="text-gray-500">Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center text-gray-400 text-sm">
              Map Placeholder
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
