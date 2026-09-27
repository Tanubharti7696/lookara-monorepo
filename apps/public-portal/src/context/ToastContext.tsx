// apps/public-portal/src/context/ToastContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type Toast = { id: number; message: string };
type ToastContextValue = { showToast: (message: string) => void };

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="toast show">{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}