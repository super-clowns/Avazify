import { useState } from 'react';

interface RejectionModalProps {
  isOpen: boolean;
  artistName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectionModal({ isOpen, artistName, onClose, onConfirm }: RejectionModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('لطفاً علت رد درخواست را وارد کنید.');
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        direction: 'rtl'
      }}
    >
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '420px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#c62828' }}>رد درخواست احراز هویت</h4>
        <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
          لطفاً علت رد درخواست حساب هنری **{artistName}** را جهت اطلاع ایشان ذکر کنید:
        </p>
        
        <textarea 
          value={reason} 
          onChange={(e) => setReason(e.target.value)}
          placeholder="به عنوان مثال: نمونه کارهای ارسالی کیفیت لازم را ندارند یا با قوانین پلتفرم مغایر هستند..." 
          style={{
            width: '100%', height: '110px', marginBottom: '15px', padding: '10px',
            borderRadius: '6px', border: '1px solid #ccc', resize: 'none',
            fontFamily: 'inherit', fontSize: '13px', boxSizing: 'border-box'
          }}
        />
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleSubmit} 
            style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ثبت و رد درخواست
          </button>
          <button 
            onClick={onClose} 
            style={{ backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}