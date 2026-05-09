import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationIcon, XIcon } from '@heroicons/react/outline';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmModal: React.FC<Props> = ({
  open, onClose, onConfirm, title = 'Confirm', message = 'Are you sure?',
  confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', loading,
}) => {
  const colors = {
    danger: { icon: 'text-red-600', bg: 'bg-red-100', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { icon: 'text-yellow-600', bg: 'bg-yellow-100', btn: 'bg-yellow-600 hover:bg-yellow-700' },
    info: { icon: 'text-blue-600', bg: 'bg-blue-100', btn: 'bg-blue-600 hover:bg-blue-700' },
  };
  const c = colors[variant];

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <button onClick={onClose} className="absolute top-4 right-4"><XIcon className="h-5 w-5 text-gray-400" /></button>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${c.bg}`}>
                  <ExclamationIcon className={`h-6 w-6 ${c.icon}`} />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-medium text-gray-900">{title}</Dialog.Title>
                  <p className="mt-2 text-sm text-gray-500">{message}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">{cancelText}</button>
                <button onClick={onConfirm} disabled={loading} className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${c.btn} disabled:opacity-50`}>{loading ? 'Processing...' : confirmText}</button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
