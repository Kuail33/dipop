import React from 'react';
import { MaterialIcon } from './MaterialIcon';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-[#041E42] text-white text-sm font-medium rounded-xl shadow-lg border border-[#003DA5]/30 transform transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <MaterialIcon name="check_circle" filled size={18} className="text-[#009CDE]" />
          <span>{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 text-white/70 hover:text-white p-0.5 rounded cursor-pointer"
            aria-label="Dismiss notification"
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
