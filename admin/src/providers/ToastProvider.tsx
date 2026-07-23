'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => addToast({ type: 'success', title, message }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ type: 'error', title, message }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ type: 'warning', title, message }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ type: 'info', title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-lg shadow-lg border text-sm transition-all duration-200 bg-white dark:bg-slate-800 dark:border-slate-700 ${
              toast.type === 'success'
                ? 'border-emerald-500 text-emerald-900 dark:text-emerald-200'
                : toast.type === 'error'
                ? 'border-rose-500 text-rose-900 dark:text-rose-200'
                : toast.type === 'warning'
                ? 'border-amber-500 text-amber-900 dark:text-amber-200'
                : 'border-sky-500 text-sky-900 dark:text-sky-200'
            }`}
          >
            <div className="mr-3 mt-0.5">
              {toast.type === 'success' && <Icon name="check-circle" className="text-emerald-500" />}
              {toast.type === 'error' && <Icon name="alert-circle" className="text-rose-500" />}
              {toast.type === 'warning' && <Icon name="alert-triangle" className="text-amber-500" />}
              {toast.type === 'info' && <Icon name="info" className="text-sky-500" />}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{toast.title}</div>
              {toast.message && <div className="text-xs mt-1 text-slate-600 dark:text-slate-400">{toast.message}</div>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <Icon name="x" size="sm" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
