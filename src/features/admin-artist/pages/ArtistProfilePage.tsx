import React, { useState } from 'react';
import VerifiedBadge from '../../../components/VerifiedBadge';

interface Track {
  id: string;
  title: string;
  duration: string;
  plays: string;
  type: 'تک آهنگ' | 'آلبوم';
}

export default function ArtistProfile() {
  const [isGoldUser, setIsGoldUser] = useState<boolean>(false);

  const [artist] = useState({
    name: 'سهراب پاکزاد',
    username: 'sohrab_pakzad',
    bio: 'خواننده، آهنگساز و ترانه‌سرا در سبک پاپ. فعالیت حرفه‌ای از سال ۱۳۸۵ با انتشار قطعات مستقل و برگزاری کنسرت‌های متعدد در سراسر ایران.',
    genres: ['پاپ', 'آکوستیک'],
    isVerified: true,
    followers: '۴۵,۲۰۰',
    monthlyListeners: '۱۲۸,۰۰۰',
    totalStreams: '۲,۴۰۰,۰۰۰',
    tracks: [
      { id: 'm1', title: 'امضا', duration: '۰۳:۲۴', plays: '۴۲۰K', type: 'تک آهنگ' },
      { id: 'm2', title: 'گل بی نقص', duration: '۰۳:۱۰', plays: '۶۸۰K', type: 'آلبوم' },
      { id: 'm3', title: 'نور چشمی', duration: '۰۲:۵۵', plays: '۳۱۰K', type: 'تک آهنگ' },
    ] as Track[]
  });

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'inherit', maxWidth: '950px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ backgroundColor: '#fff', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed #cbd5e1' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>💡 ابزار تست فاز اول: وضعیت اشتراک خود را تغییر دهید تا تغییر دسترسی آمار هنرمند را بررسی کنید:</span>
        <button 
          onClick={() => setIsGoldUser(!isGoldUser)}
          style={{ backgroundColor: isGoldUser ? '#eab308' : '#64748b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
        >
          {isGoldUser ? '🌟 اشتراک شما: طلایی' : '👤 اشتراک شما: عادی/پایه'}
        </button>
      </div>

      <div style={{ height: '200px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '12px', position: 'relative', marginBottom: '60px', display: 'flex', alignItems: 'flex-end', padding: '20px' }}>
        <div style={{ position: 'absolute', bottom: '-40px', right: '30px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '4px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '36px', fontWeight: 'bold' }}>
          {artist.name.charAt(0)}
        </div>
      </div>

      <div style={{ padding: '0 20px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ margin: 0, fontSize: '26px', color: '#1e293b' }}>{artist.name}</h1>
          {artist.isVerified && <VerifiedBadge size={22} tooltip="هنرمند تایید شده پلتفرم" />}
        </div>
        <p style={{ color: '#64748b', margin: '4px 0 15px 0', fontSize: '14px' }}>@{artist.username}</p>
        <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.7', maxWidth: '700px', textAlign: 'justify' }}>{artist.bio}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '0 20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>دنبال‌کنندگان</span>
          <strong style={{ fontSize: '20px', color: '#0f172a' }}>{artist.followers} نفر</strong>
        </div>

        {isGoldUser ? (
          <>
            <div style={{ backgroundColor: '#fef08a', padding: '16px', borderRadius: '8px', border: '1px solid #fef08a' }}>
              <span style={{ fontSize: '12px', color: '#854d0e', display: 'block', marginBottom: '4px' }}>🎧 شنوندگان ماهانه (ویژه طلایی)</span>
              <strong style={{ fontSize: '20px', color: '#854d0e' }}>{artist.monthlyListeners} نفر</strong>
            </div>
            <div style={{ backgroundColor: '#fef08a', padding: '16px', borderRadius: '8px', border: '1px solid #fef08a' }}>
              <span style={{ fontSize: '12px', color: '#854d0e', display: 'block', marginBottom: '4px' }}>📊 کل استریم‌ها (ویژه طلایی)</span>
              <strong style={{ fontSize: '20px', color: '#854d0e' }}>{artist.totalStreams} بار</strong>
            </div>
          </>
        ) : (
          <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
              🔒 مشاهده آمار تفصلی استریم‌ها و شنوندگان ماهانه این هنرمند، مخصو‌ص کاربران با **اشتراک طلایی** است.
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px' }}>
        <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>آثار منتشر شده (آلبوم‌ها و تک‌آهنگ‌ها)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {artist.tracks.map((track, index) => (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#94a3b8', fontWeight: 'bold', width: '20px' }}>{index + 1}</span>
                <div>
                  <strong style={{ color: '#334155', display: 'block', fontSize: '15px' }}>{track.title}</strong>
                  <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>{track.type}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#64748b' }}>
                <span>{track.plays} استریم</span>
                <span>{track.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}