

export default function EmptyNotifications() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        border: '2px dashed #cccccc',
        borderRadius: '12px',
        color: '#666666',
        marginTop: '20px',
        textAlign: 'center',
        direction: 'rtl'
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#999999"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: '16px' }}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      
      <h3 style={{ margin: '0 0 8px 0', color: '#444' }}>صندوق اعلانات خالی است</h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
        در حال حاضر هیچ اعلان جدید یا قدیمی برای نمایش وجود ندارد.
      </p>
    </div>
  );
}