// src/components/ConfirmModal.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  loading = false,
  isDangerous = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        {isDangerous && (
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{title}</h2>
        <p className="text-gray-600 mb-6 text-center">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;