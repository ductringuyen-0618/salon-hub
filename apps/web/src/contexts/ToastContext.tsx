import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    title: string, 
    message: string | undefined, 
    type: Toast['type'], 
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, title, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    addToast(title, message, 'success', duration);
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    addToast(title, message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    addToast(title, message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    addToast(title, message, 'info', duration);
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

// Inline toast renderer. Previously the context tracked toasts in state but
// nothing rendered them, so success/error/warning/info calls were silent.
// Now every call to error("Booking failed") etc. actually shows on screen.
const ToastViewport: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 360,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => {
        const color =
          t.type === 'error'   ? { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' } :
          t.type === 'success' ? { bg: '#f0fdf4', border: '#16a34a', text: '#166534' } :
          t.type === 'warning' ? { bg: '#fffbeb', border: '#d97706', text: '#92400e' } :
                                 { bg: '#eff6ff', border: '#2563eb', text: '#1e40af' };
        return (
          <div
            key={t.id}
            role="alert"
            style={{
              background: color.bg,
              border: `1px solid ${color.border}`,
              color: color.text,
              borderRadius: 8,
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{t.title}</div>
              {t.message && <div style={{ marginTop: 4, fontSize: 14, opacity: 0.9 }}>{t.message}</div>}
            </div>
            <button
              onClick={() => onClose(t.id)}
              aria-label="Dismiss"
              style={{
                background: 'transparent',
                border: 'none',
                color: color.text,
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};