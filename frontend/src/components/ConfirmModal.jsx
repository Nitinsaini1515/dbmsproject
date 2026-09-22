import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmText = 'Confirm',
  confirmColor = 'bg-red-600 hover:bg-red-700',
  loading = false 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition shadow-xs ${confirmColor} flex items-center gap-2`}
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
          <span>{confirmText}</span>
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
