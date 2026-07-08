

interface SearchBarProps {
  query: string;
  sortBy: 'listeners' | 'date';
  onQueryChange: (q: string) => void;
  onSortChange: (sort: 'listeners' | 'date') => void;
}

export default function SearchBar({ query, sortBy, onQueryChange, onSortChange }: SearchBarProps) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', direction: 'rtl' }}>
      <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="جستجوی آهنگ یا هنرمند..."
          style={{
            width: '100%', padding: '10px 14px', paddingRight: '40px', borderRadius: '8px',
            border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            backgroundColor: '#fff',
          }}
        />
        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          🔍
        </span>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => onSortChange('listeners')}
          style={{
            padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
            backgroundColor: sortBy === 'listeners' ? '#3b82f6' : '#fff',
            color: sortBy === 'listeners' ? '#fff' : '#475569',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
          }}
        >
          پربیننده‌ترین
        </button>
        <button
          onClick={() => onSortChange('date')}
          style={{
            padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
            backgroundColor: sortBy === 'date' ? '#3b82f6' : '#fff',
            color: sortBy === 'date' ? '#fff' : '#475569',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
          }}
        >
          جدیدترین
        </button>
      </div>
    </div>
  );
}
