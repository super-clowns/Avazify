import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Track {
  id: string;
  title: string;
  type: 'single' | 'album';
  genre: string;
  year: string;
  collaborators: string;
  streams: string;
  revenue: string;
}

export default function ArtistConsole() {
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', title: 'Summer Glow', type: 'single', genre: 'Indie Pop', year: '۲۰۲۶', collaborators: 'Producer X', streams: '۹۸.۰K', revenue: '$۱,۴۵۰' },
    { id: '2', title: 'امضا', type: 'album', genre: 'پاپ', year: '۱۴۰۵', collaborators: 'علی راد', streams: '۴۲.۰K', revenue: '۸,۴۰۰,۰۰۰ تومان' },
  ]);

  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('۱۴۰۵');
  const [releaseType, setReleaseType] = useState<'single' | 'album'>('single');
  const [genre, setGenre] = useState('');
  const [lyrics, setLyrics] = useState('');
  
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [collabName, setCollabName] = useState('');

  const addCollaborator = () => {
    if (!collabName.trim()) return;
    setCollaborators([...collaborators, collabName.trim()]);
    setCollabName('');
  };

  const removeCollaborator = (index: number) => {
    setCollaborators(collaborators.filter((_, i) => i !== index));
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این قطعه اطمینان دارید؟')) {
      setTracks(tracks.filter(t => t.id !== id));
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('لطفاً عنوان اثر را وارد کنید.');

    const collabString = collaborators.join('، ') || '-';

    const newTrack: Track = {
      id: Date.now().toString(),
      title,
      type: releaseType,
      genre: genre || 'نامشخص',
      year: releaseYear,
      collaborators: collabString,
      streams: '۰.۰K',
      revenue: '۰ تومان'
    };

    setTracks([newTrack, ...tracks]);
    
    setTitle('');
    setGenre('');
    setLyrics('');
    setCollaborators([]);
    setIsUploadOpen(false);
  };

  return (
    <div style={{ 
      direction: 'rtl', 
      minHeight: '100vh', 
      backgroundColor: '#070a12', 
      backgroundImage: 'radial-gradient(circle at 50% -20%, #1e2942 0%, #070a12 60%)',
      color: '#f1f5f9', 
      padding: '50px 20px',
      fontFamily: 'sans-serif'
    }}>
      
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '36px', 
          background: 'linear-gradient(180deg, #1e2538 0%, #111625 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '20px 28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>استودیو شخصی Luna Echo</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>مرکز مدیریت آثار، ارزیابی تعداد استریم‌ها و پاداش‌های مالی شما</p>
            </div>
          </div>

          <div onClick={() => navigate('/test/artist')} style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', padding: '6px 14px', borderRadius: '14px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '14px', display: 'block' }}>Luna Echo</strong>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>نمایه عمومی 🌟</span>
            </div>
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Profile" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={{ position: 'relative', background: 'rgba(17, 22, 37, 0.6)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '14px' }}>کل پخش قطعات (Streams)</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '32px', fontWeight: '900' }}>۱۸.۵M <span style={{ fontSize: '16px', color: '#38bdf8' }}>بار</span></strong>
              <svg width="48" height="48" viewBox="0 0 36 36" style={{ filter: 'drop-shadow(0px 0px 6px #38bdf8)' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="100" strokeDashoffset="28" transform="rotate(-90 18 18)" />
              </svg>
            </div>
          </div>

          <div style={{ position: 'relative', background: 'rgba(17, 22, 37, 0.6)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(45, 212, 191, 0.15)' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '14px' }}>شنوندگان ماهانه</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '32px', fontWeight: '900', color: '#2dd4bf' }}>۳.۱M <span style={{ fontSize: '16px' }}>نفر</span></strong>
              <svg width="85" height="34" viewBox="0 0 85 34" fill="none" style={{ filter: 'drop-shadow(0px 0px 5px #2dd4bf)' }}>
                {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((x, i) => (
                  <rect key={x} x={x} y={10 + (i % 3) * 5} width="5" height={24 - (i % 3) * 5} rx="2.5" fill="#2dd4bf" opacity={0.4 + (i % 2) * 0.5} />
                ))}
              </svg>
            </div>
          </div>

          <div style={{ position: 'relative', background: 'rgba(17, 22, 37, 0.6)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(74, 222, 128, 0.15)' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '14px' }}>کل درآمد کسب شده</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '32px', fontWeight: '900', color: '#4ade80' }}>$۴۳,۱۵۰</strong>
              <svg width="95" height="34" viewBox="0 0 95 34" fill="none" style={{ filter: 'drop-shadow(0px 0px 6px #4ade80)' }}>
                <path d="M5 28C18 28 22 18 32 21C42 24 48 8 58 13C68 18 72 4 82 6C87 7 89 3 92 2" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>آثار منتشر شده ({tracks.length})</h3>
          <button 
            onClick={() => setIsUploadOpen(true)} 
            style={{ background: 'linear-gradient(135deg, #1266f1 0%, #3b82f6 100%)', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            انتشار اثر جدید
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tracks.map(track => (
            <div key={track.id} style={{ background: 'rgba(17, 22, 37, 0.7)', padding: '18px 24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{ width: '52px', height: '52px', background: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                </div>
                <div>
                  <strong style={{ fontSize: '16px', display: 'block' }}>{track.title}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>{track.genre} • {track.year} {track.collaborators !== '-' && `• همکاران: ${track.collaborators}`}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '44px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#475569', display: 'block' }}>استریم</span>
                  <strong style={{ fontSize: '15px', color: '#38bdf8' }}>{track.streams}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#475569', display: 'block' }}>درآمد</span>
                  <strong style={{ fontSize: '15px', color: '#4ade80' }}>{track.revenue}</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => alert('ویرایش اثر')} style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer' }}><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M16.732 3.732a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => handleDelete(track.id)} style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#f87171', cursor: 'pointer' }}><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v4M4 7h16" /></svg></button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {isUploadOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3, 7, 18, 0.9)', backdropFilter: 'blur(16px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handlePublish} style={{ 
            backgroundColor: '#0f1424', 
            padding: '35px', 
            borderRadius: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            maxWidth: '950px', 
            width: '100%', 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px' 
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff', fontWeight: 'bold' }}>📤 Upload New Track (فرم کامل ارزیابی آثار)</h3>
              <span style={{ fontSize: '12px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>Luna Echo Studio</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#38bdf8' }}>۱. اطلاعات آهنگ (Song Info)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#94a3b8' }}>Song Title *</label>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Glow" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#070a12', color: '#fff', fontSize: '13px' }} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#94a3b8' }}>Type</label>
                        <select value={releaseType} onChange={(e) => setReleaseType(e.target.value as 'single' | 'album')} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#070a12', color: '#fff', fontSize: '13px' }}>
                          <option value="single">Single</option>
                          <option value="album">Album</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#94a3b8' }}>Release Year</label>
                        <input type="text" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#070a12', color: '#fff', fontSize: '13px' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#94a3b8' }}>Genre (دستی وارد شود)</label>
                      <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Pop, Indie, Rock" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#070a12', color: '#fff', fontSize: '13px' }} />
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#38bdf8' }}>۳. همکاران (Contributors)</h4>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <input 
                      type="text" 
                      value={collabName} 
                      onChange={(e) => setCollabName(e.target.value)} 
                      placeholder="نام همکار را وارد کنید" 
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#070a12', color: '#fff', fontSize: '13px' }} 
                    />
                    <button type="button" onClick={addCollaborator} style={{ backgroundColor: '#2dd4bf', color: '#070a12', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Add +</button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {collaborators.map((name, idx) => (
                      <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: '#2dd4bf' }}>
                        {name}
                        <b onClick={() => removeCollaborator(idx)} style={{ cursor: 'pointer', color: '#f87171', marginRight: '4px', fontSize: '14px' }}>×</b>
                      </span>
                    ))}
                    {collaborators.length === 0 && <span style={{ fontSize: '12px', color: '#475569' }}>هنوز همکاری ثبت نشده است.</span>}
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '28px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: '#38bdf8', fontWeight: 'bold' }}>۲. بارگذاری رسانه‌ها و ترانه</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ border: '1px dashed rgba(255, 255, 255, 0.15)', padding: '24px 16px', borderRadius: '12px', textAlign: 'center', backgroundColor: '#070a12', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>📁 صوتی (MP3/WAV/FLAC)</label>
                    <input type="file" accept=".mp3,.wav,.flac" style={{ fontSize: '11px', width: '100%', color: '#64748b' }} />
                  </div>
                  <div style={{ border: '1px dashed rgba(255, 255, 255, 0.15)', padding: '24px 16px', borderRadius: '12px', textAlign: 'center', backgroundColor: '#070a12', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>🖼️ تصویر کاور</label>
                    <input type="file" accept="image/*" style={{ fontSize: '11px', width: '100%', color: '#64748b' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8' }}>متن آهنگ (Lyrics)</label>
                  <textarea rows={6} value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="متن شعر یا موزیک را جهت نمایش در پخش‌کننده وارد کنید..." style={{ width: '100%', flex: 1, minHeight: '150px', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#070a12', color: '#fff', fontSize: '13px', fontFamily: 'inherit', resize: 'none' }} />
                </div>
              </div>

            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-start', gap: '14px' }}>
              <button type="submit" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>تایید و انتشار نهایی اثر</button>
              <button type="button" onClick={() => setIsUploadOpen(false)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 26px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>انصراف</button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}