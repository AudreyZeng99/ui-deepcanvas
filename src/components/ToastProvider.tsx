import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastLevel = 'success';

type ToastItem = {
  id: string;
  message: string;
  level: ToastLevel;
};

type ToastContextValue = {
  show: (message: string) => void;
  success: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current[id];
    if (timer) window.clearTimeout(timer);
    delete timersRef.current[id];
  }, []);

  const push = useCallback(
    (message: string, level: ToastLevel) => {
      const id = crypto.randomUUID();
      const item: ToastItem = { id, message, level };
      setToasts((prev) => [...prev, item].slice(-3));
      timersRef.current[id] = window.setTimeout(() => dismiss(id), 1800);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show: (message: string) => {
        const normalized = message.trim();
        if (!normalized) return;
        push(normalized, 'success');
      },
      success: (message: string) => {
        const normalized = message.trim();
        if (!normalized) return;
        push(normalized, 'success');
      },
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-center">
          {toasts.map((toast) => (
            <div key={toast.id} className="toast-breeze-top" role="status" aria-live="polite">
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
