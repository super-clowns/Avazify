import { useToast } from '../context/ToastContext';
import Icon from './Icon';

export default function ToastViewport() {
  const { toasts, dismissToast } = useToast();
  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.tone}`} key={toast.id}>
          <Icon name={toast.tone === 'success' ? 'success' : toast.tone === 'error' ? 'warning' : 'info'} />
          <span>{toast.text}</span>
          <button type="button" onClick={() => dismissToast(toast.id)} aria-label="بستن پیام">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
