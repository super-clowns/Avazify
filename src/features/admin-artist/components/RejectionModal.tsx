import { useState } from 'react';
import Button from '../../../components/Button';

interface RejectionModalProps {
  isOpen: boolean;
  artistName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectionModal({
  isOpen,
  artistName,
  onClose,
  onConfirm,
}: RejectionModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const submit = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>رد درخواست هنرمند</h2>
        <p>علت رد درخواست «{artistName}» را برای اطلاع‌رسانی به ایشان بنویسید:</p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="مثلاً: نمونه کارهای ارسالی کیفیت لازم را ندارند."
        />

        <div className="page-actions">
          <Button variant="danger" onClick={submit}>
            ثبت و رد درخواست
          </Button>
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
}