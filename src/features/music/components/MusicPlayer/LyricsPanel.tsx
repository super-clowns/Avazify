

interface LyricsPanelProps {
  lyrics?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LyricsPanel({ lyrics, isOpen, onClose }: LyricsPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: '80px', left: '20px', width: '360px', maxHeight: '400px',
        backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
        padding: '20px', zIndex: 1000, overflowY: 'auto', direction: 'rtl', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, color: '#e2e8f0', fontSize: '14px' }}>متن آهنگ</h4>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>
          ✕
        </button>
      </div>
      {lyrics ? (
        <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '2', margin: 0, whiteSpace: 'pre-wrap' }}>
          {lyrics}
        </p>
      ) : (
        <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', margin: '40px 0' }}>
          متنی برای این آهنگ ثبت نشده است.
        </p>
      )}
    </div>
  );
}
