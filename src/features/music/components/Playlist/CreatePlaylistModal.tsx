import { useState } from 'react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export default function CreatePlaylistModal({ isOpen, onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim() || undefined);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 1100, direction: 'rtl',
      }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>ایجاد پلی‌لیست جدید</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>نام پلی‌لیست *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="مثال: آهنگ‌های مورد علاقه"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              autoFocus required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>توضیحات (اختیاری)</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="توضیح کوتاه..."
              rows={3}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: '#475569' }}>
              انصراف
            </button>
            <button type="submit" style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
              ایجاد پلی‌لیست
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
