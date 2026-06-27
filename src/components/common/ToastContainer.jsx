/**
 * Toast Notification component.
 * Renders a stack of transient notifications. Each toast auto-dismisses
 * after 4 seconds via a setTimeout in useEffect.
 */

import { useEffect } from 'react';
import { useTaskStore } from '../../store/TaskContext';

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

function Toast({ toast }) {
  const { removeToast } = useTaskStore();

  useEffect(() => {
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => removeToast(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div
      className={`toast ${toast.type}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="toast-icon" aria-hidden="true">{ICONS[toast.type] || ICONS.info}</span>
      <span className="toast-msg">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { state } = useTaskStore();
  const { toasts } = state;

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
