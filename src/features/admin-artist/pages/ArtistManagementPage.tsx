import React, { useState } from 'react';

interface PublishedTrack {
  id: string;
  title: string;
  type: 'single' | 'album';
  genre: string;
  year: string;
  collaborators: string;
  streams: number;
  listeners: number;
  revenue: string;
}

export default function ArtistConsole() {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'analytics'>('upload');

  const [tracks, setTracks] = useState<PublishedTrack[]>([
    { id: '1', title: 'گل بی نقص', type: 'album', genre: 'پاپ', year: '۱۴۰۴', collaborators: 'علی راد', streams: 680000, listeners: 45000, revenue: '۱۳,۶۰۰,۰۰۰ تومان' },
    { id: '2', title: 'امضا', type: 'single', genre: 'پاپ', year: '۱۴۰۵', collaborators: '-', streams: 420000, listeners: 32000, revenue: '۸,۴۰۰,۰۰۰ تومان' },
  ]);

  const [title, setTitle] = useState('');
  const [releaseType, setReleaseType] = useState<'single' | 'album'>('single');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('۱۴۰۵');
  const [collaborators, setCollaborators] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این اثر اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) {
      setTracks(tracks.filter(t => t.id !== id));
      alert('اثر با موفقیت حذف شد (تغییرات به صورت ماک اعمال شد).');
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !audioFile || !coverFile) {
      alert('لطفاً عنوان، فایل صوتی و تصویر کاور را حتماً بارگذاری کنید.');
      return;
    }

    const newTrack: PublishedTrack = {
      id: Date.now().toString(),
      title,
      type: releaseType,
      genre: genre || 'عمومی',
      year,
      collaborators: collaborators || '-',
      streams: 0,
      listeners: 0,
      revenue: '۰ تومان'
    };

    setTracks([newTrack, ...tracks]);
    alert('اثر جدید با موفقیت به صورت ماک ثبت و به لیست آثار شما اضافه شد!');
    setTitle('');
    setLyrics('');
    setCollaborators('');
    setAudioFile(null);
    setCoverFile(null);
    setActiveTab('manage');
  };

  return (
    <div style={{ direction: 'rtl', padding: '25px', fontFamily: 'inherit', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      
      <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '22px', color: '#0f172a', margin: 0 }}>🎙️ استودیو هنرمندان پلتفرم</h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>مرکز مدیریت آثار، آپلود موزیک و ارزیابی مالی درآمدها</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('upload')} style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'upload' ? '#2563eb' : '#f1f5f9', color: activeTab === 'upload' ? '#fff' : '#475569' }}>
          📤 آپلود اثر جدید
        </button>
        <button onClick={() => setActiveTab('manage')} style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'manage' ? '#2563eb' : '#f1f5f9', color: activeTab === 'manage' ? '#fff' : '#475569' }}>
          🎵 لیست و مدیریت آثار ({tracks.length})
        </button>
        <button onClick={() => setActiveTab('analytics')} style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'analytics' ? '#2563eb' : '#f1f5f9', color: activeTab === 'analytics' ? '#fff' : '#475569' }}>
          📊 آمار جامع و درآمدها
        </button>
      </div>

      {activeTab === 'upload' && (
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>عنوان قطعه یا آلبوم *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: قطعه جدید دریا" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>نوع انتشار *</label>
              <select value={releaseType} onChange={(e) => setReleaseType(e.target.value as 'single' | 'album')} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                <option value="single">تک آهنگ</option>
                <option value="album">آلبوم</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>ژانر / سبک</label>
              <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="مثال: پاپ، راک" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>سال انتشار</label>
              <input type="text" value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>هنرمندان همکار (Feat)</label>
              <input type="text" value={collaborators} onChange={(e) => setCollaborators(e.target.value)} placeholder="نام تنظیم‌کننده یا خواننده مهمان" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>آپلود فایل صوتی (فرمت‌های مجاز: MP3, WAV, FLAC) *</label>
              <input type="file" accept=".mp3,.wav,.flac" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} style={{ fontSize: '13px' }} />
              {audioFile && <span style={{ color: '#16a34a', display: 'block', fontSize: '12px', marginTop: '4px' }}>✓ فایل {audioFile.name} انتخاب شد.</span>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>آپلود تصویر کاور (Cover Art) *</label>
              <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} style={{ fontSize: '13px' }} />
              {coverFile && <span style={{ color: '#16a34a', display: 'block', fontSize: '12px', marginTop: '4px' }}>✓ کاور انتخاب شد.</span>}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>متن آهنگ (Lyrics)</label>
            <textarea rows={4} value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="متن ترانه را جهت نمایش در پخش‌کننده اینجا وارد کنید..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
          </div>

          <button type="submit" style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '10px' }}>
            🚀 انتشار رسمی اثر روی سامانه
          </button>
        </form>
      )}

      {activeTab === 'manage' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px' }}>عنوان اثر</th>
                <th style={{ padding: '12px' }}>نوع</th>
                <th style={{ padding: '12px' }}>سبک</th>
                <th style={{ padding: '12px' }}>سال تولید</th>
                <th style={{ padding: '12px' }}>کل استریم‌ها</th>
                <th style={{ padding: '12px' }}>عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{t.title}</td>
                  <td style={{ padding: '12px' }}>{t.type === 'single' ? 'تک آهنگ' : 'آلبوم'}</td>
                  <td style={{ padding: '12px' }}>{t.genre}</td>
                  <td style={{ padding: '12px' }}>{t.year}</td>
                  <td style={{ padding: '12px' }}>{t.streams.toLocaleString()} بار</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => alert(`امکان ویرایش متا دیتای اثر ${t.title} در فاز اول (ماک)`)} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', marginLeft: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️ ویرایش</button>
                    <button onClick={() => handleDelete(t.id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️ حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: '#1e40af', display: 'block', marginBottom: '6px' }}>مجموع شنوندگان آثار شما</span>
              <strong style={{ fontSize: '24px', color: '#1e3a8a' }}>۷۷,۰۰۰ نفر</strong>
            </div>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: '#1e40af', display: 'block', marginBottom: '6px' }}>مجموع استریم‌ها (پخش)</span>
              <strong style={{ fontSize: '24px', color: '#1e3a8a' }}>۱,۱۰۰,۰۰۰ بار</strong>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: '#166534', display: 'block', marginBottom: '6px' }}>💰 کل پاداش و درآمد کسب‌شده</span>
              <strong style={{ fontSize: '24px', color: '#14532d' }}>۲۲,۰۰۰,۰۰۰ تومان</strong>
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>💡 نحوه محاسبه پاداش مالی ماهانه:</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
              پاداش و کارکرد مالی شما در پلتفرم به صورت تابعی مستقیم از تعداد کل شنوندگان منحصر‌به‌فرد و حجم استریم قطعات صوتی شما محاسبه می‌گردد. جزییات این محاسبات فرآیند پس از پایان ماه جاری تسویه خواهد شد.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}