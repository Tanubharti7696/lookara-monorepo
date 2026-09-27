// apps/owner-portal/src/components/NotificationBtn/NotificationBtn.tsx
import { useToast } from '../../context/ToastContext';
import './NotificationBtn.css';

export default function NotificationBtn() {
  const { showToast } = useToast();

  return (
    <button
      type="button"
      className="notif-btn"
      aria-label="Notifications"
      onClick={() => showToast('No new notifications', 'info')}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M8 1a5 5 0 00-5 5v3l-1.5 2h13L13 9V6a5 5 0 00-5-5zM6.5 14a1.5 1.5 0 003 0" />
      </svg>
      <span className="notif-dot" />
    </button>
  );
}
