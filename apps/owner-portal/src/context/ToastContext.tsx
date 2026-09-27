// apps/owner-portal/src/context/ToastContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'danger' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = {
  success: '✓',
  danger: '✕',
  info: 'ℹ',
};

const BORDER: Record<ToastType, string> = {
  success: 'rgba(34,197,94,0.3)',
  danger: 'rgba(220,38,38,0.3)',
  info: 'var(--border)',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });
  const timer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    window.clearTimeout(timer.current);
    setToast({ message, type, visible: true });
    timer.current = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`toast${toast.visible ? ' is-visible' : ''}`}
        style={{ borderColor: BORDER[toast.type] }}
        role="status"
        aria-live="polite"
      >
        <span className="toast__icon">{ICONS[toast.type]}</span>
        <span>{toast.message}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
