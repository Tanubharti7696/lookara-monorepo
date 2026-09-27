// apps/vendor-portal/src/context/VendorContext.tsx
import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

export type WorkState = 'online' | 'paused' | 'offline';
export type ToastTone = 'info' | 'success' | 'danger' | 'warn' | 'emg';

interface VendorContextValue {
  /* profile */
  vendorName: string;
  vendorInitials: string;
  vendorTier: string;
  vendorTrade: string;
  coverage: string;
  poolsActive: number;

  /* dispatch status */
  workState: WorkState;
  setWorkState: (s: WorkState) => void;
  emergency: boolean;
  setEmergency: (v: boolean) => void;
  acceptingJobs: boolean;
  setAcceptingJobs: (v: boolean) => void;
  hasActiveJob: boolean;
  complianceAtRisk: boolean;

  /* nav counts */
  unreadAlerts: number;
  pendingJobs: number;

  /* toast */
  showToast: (msg: string, tone?: ToastTone) => void;
}

const Ctx = createContext<VendorContextValue | null>(null);
export const useVendor = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useVendor must be used inside VendorProvider');
  return v;
};

export function VendorProvider({ children }: { children: ReactNode }) {
  const [workState, setWorkStateRaw]   = useState<WorkState>('online');
  const [emergency, setEmergency]      = useState(true);
  const [acceptingJobs, setAcceptingJobs] = useState(true);

  /* toast */
  const [toast, setToast] = useState<{ msg: string; tone: ToastTone; visible: boolean }>({
    msg: '', tone: 'info', visible: false,
  });
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string, tone: ToastTone = 'info') => {
    setToast({ msg, tone, visible: true });
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 3000);
  }, []);

  const [hasActiveJob] = useState(true);

  const setWorkState = useCallback((s: WorkState) => {
    if (s === 'offline' && hasActiveJob) {
      showToast('Cannot go offline — you have an active job in progress', 'danger');
      return;
    }
    setWorkStateRaw(s);
    if (s === 'offline' || s === 'paused') setEmergency(false);
  }, [hasActiveJob, showToast]);

  const value: VendorContextValue = {
    vendorName: 'Marcus Reed',
    vendorInitials: 'MR',
    vendorTier: 'Elite',
    vendorTrade: 'Pool & Plumbing',
    coverage: '30 mi radius',
    poolsActive: 2,

    workState, setWorkState,
    emergency, setEmergency,
    acceptingJobs, setAcceptingJobs,
    hasActiveJob: true,
    complianceAtRisk: true,

    unreadAlerts: 4,
    pendingJobs: 5,

    showToast,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className={`v-toast tone-${toast.tone} ${toast.visible ? 'visible' : ''}`}>
        {toast.msg}
      </div>
    </Ctx.Provider>
  );
}