import React, { useState } from 'react';
import RejectionModal from './RejectionModal';
import TicketChatBox from './TicketChatBox';
import type { TicketData } from './TicketChatBox';

interface ArtistRequest {
  id: string;
  name: string;
  email: string;
  portfolio: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function TicketsAndAuth() {
  const [activeTab, setActiveTab] = useState<'artists' | 'tickets'>('artists');
  
  const [artists, setArtists] = useState<ArtistRequest[]>([
    { id: '1', name: 'سهراب پاکزاد', email: 'sohrab@example.com', portfolio: 'لینک نمونه کار آثار سنتی و پاپ', status: 'pending' },
    { id: '2', name: 'الناز محمدی', email: 'elnaz@example.com', portfolio: 'فایل صوتی ترک جدید گیتار نوازی', status: 'pending' },
  ]);

  const [tickets, setTickets] = useState<TicketData[]>([
    { id: 'T-101', username: 'علی رضایی', subject: 'عدم فعال‌سازی اشتراک طلایی', date: '۱۴۰۵/۰۴/۱۵', status: 'open', messages: [{ sender: 'user', text: 'من اکانت طلایی خریدم ولی هنوز برام اعمال نشده.', time: '۱۲:۳۰' }] },
    { id: 'T-102', username: 'مریم امیری', subject: 'خطا در پخش آهنگ اختصاصی', date: '۱۴۰۵/۰۴/۱۶', status: 'closed', messages: [{ sender: 'user', text: 'آهنگ‌ها وسط پخش قطع میشن.', time: '۰۹:۱۵' }] },
  ]);

  const [selectedArtist, setSelectedArtist] = useState<ArtistRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

  const handleApproveArtist = (id: string) => {
    setArtists(artists.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    setSelectedArtist(null);
    alert('حساب هنرمند تایید شد و اعلان برای او ارسال گردید.');
  };

  const handleRejectArtistConfirm = (reason: string) => {
    setArtists(artists.map(a => a.id === selectedArtist?.id ? { ...a, status: 'rejected' } : a));
    setShowRejectModal(false);
    setSelectedArtist(null);
    alert(`درخواست رد شد.\nعلت ارسال شده: ${reason}`);
  };

  const handleSendReply = (text: string) => {
    if (!selectedTicket) return;
    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const updated: TicketData = {
          ...t,
          status: 'answered',
          messages: [...t.messages, { sender: 'support', text: text, time: '۱۵:۱۰' }]
        };
        setSelectedTicket(updated);
        return updated;
      }
      return t;
    });
    setTickets(updatedTickets);
  };

  return (
    <div style={{ direction: 'rtl', padding: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('artists')}
          style={{ padding: '10px 20px', backgroundColor: activeTab === 'artists' ? '#0070f3' : '#eee', color: activeTab === 'artists' ? 'white' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          درخواست‌های تایید هنرمندان
        </button>
        <button 
          onClick={() => setActiveTab('tickets')}
          style={{ padding: '10px 20px', backgroundColor: activeTab === 'tickets' ? '#0070f3' : '#eee', color: activeTab === 'tickets' ? 'white' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          تیکت‌های پشتیبانی سیستمی
        </button>
      </div>

      {activeTab === 'artists' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px' }}>نام هنری</th>
                <th style={{ padding: '12px' }}>ایمیل</th>
                <th style={{ padding: '12px' }}>وضعیت</th>
                <th style={{ padding: '12px' }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {artists.map(artist => (
                <tr key={artist.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{artist.name}</td>
                  <td style={{ padding: '12px' }}>{artist.email}</td>
                  <td style={{ padding: '12px', color: artist.status === 'approved' ? 'green' : artist.status === 'rejected' ? 'red' : 'orange', fontWeight: 'bold' }}>
                    {artist.status === 'pending' ? 'در انتظار تایید' : artist.status === 'approved' ? 'تایید شده' : 'رد شده'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {artist.status === 'pending' && (
                      <button onClick={() => setSelectedArtist(artist)} style={{ backgroundColor: '#0070f3', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                        مشاهده نمونه کار
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedArtist && (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fafafa' }}>
              <h4>بررسی مدارک و نمونه کار: {selectedArtist.name}</h4>
              <p style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #eee', fontSize: '14px' }}>{selectedArtist.portfolio}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => handleApproveArtist(selectedArtist.id)} style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve (تایید)</button>
                <button onClick={() => setShowRejectModal(true)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reject (رد درخواست)</button>
              </div>
            </div>
          )}

          <RejectionModal 
            isOpen={showRejectModal}
            artistName={selectedArtist?.name || ''}
            onClose={() => setShowRejectModal(false)}
            onConfirm={handleRejectArtistConfirm}
          />
        </div>
      )}

      {activeTab === 'tickets' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: '20px' }}>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px' }}>شناسه</th>
                  <th style={{ padding: '12px' }}>کاربر</th>
                  <th style={{ padding: '12px' }}>موضوع</th>
                  <th style={{ padding: '12px' }}>تاریخ</th>
                  <th style={{ padding: '12px' }}>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} style={{ borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: selectedTicket?.id === ticket.id ? '#e6f7ff' : 'transparent' }}>
                    <td style={{ padding: '12px' }}>{ticket.id}</td>
                    <td style={{ padding: '12px' }}>{ticket.username}</td>
                    <td style={{ padding: '12px' }}>{ticket.subject}</td>
                    <td style={{ padding: '12px' }}>{ticket.date}</td>
                    <td style={{ padding: '12px', color: ticket.status === 'open' ? 'red' : ticket.status === 'answered' ? 'blue' : 'green', fontWeight: 'bold' }}>
                      {ticket.status === 'open' ? 'باز' : ticket.status === 'answered' ? 'پاسخ داده شده' : 'بسته شده'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedTicket && (
            <TicketChatBox 
              ticket={selectedTicket} 
              onSendReply={handleSendReply} 
            />
          )}
        </div>
      )}
    </div>
  );
}