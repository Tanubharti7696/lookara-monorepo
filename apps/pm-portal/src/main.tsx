import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css';

// Global fallback for prototype onclick handlers
const win = window as any;
if (typeof window !== 'undefined' && !win.showToast) {
  win.showToast = function(msg: string, type?: string) {
    console.log('[Lookara Toast]', type || 'info', msg);
    const existing = document.getElementById('lookara-global-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'lookara-global-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;padding:12px 18px;border-radius:8px;font-size:14px;font-weight:600;color:#fff;box-shadow:0 10px 25px rgba(0,0,0,0.4);display:flex;align-items:center;gap:10px;';
    if (type === 'success') {
      toast.style.background = '#059669';
      toast.style.border = '1px solid #10B981';
      toast.textContent = '✓ ' + msg;
    } else if (type === 'danger' || type === 'error') {
      toast.style.background = '#DC2626';
      toast.style.border = '1px solid #EF4444';
      toast.textContent = '✕ ' + msg;
    } else if (type === 'warning' || type === 'warn') {
      toast.style.background = '#D97706';
      toast.style.border = '1px solid #F59E0B';
      toast.textContent = '⚠ ' + msg;
    } else {
      toast.style.background = '#1E293B';
      toast.style.border = '1px solid #475569';
      toast.textContent = 'ℹ ' + msg;
    }
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
