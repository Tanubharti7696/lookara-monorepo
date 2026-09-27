// src/context/ToastContext.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type Tone = 'ok' | 'red' | 'yellow' | 'blue' | 'neutral';
type Toast = { id: number; message: string; tone: Tone };

type ToastContextValue = { toast: (message: string, tone?: Tone) => void };

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const COLORS: Record<Tone, string> = {
  ok: '#10B981',
  red: '#EF4444',
  yellow: '#F59E0B',
  blue: '#3B82F6',
  neutral: '#6B7280',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: Tone = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast"
            style={{ background: COLORS[t.tone], color: '#fff' }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}