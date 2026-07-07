import React, { useState } from 'react';

export interface Message {
  sender: 'user' | 'support';
  text: string;
  time: string;
}

export interface TicketData {
  id: string;
  username: string;
  subject: string;
  date: string;
  status: 'open' | 'answered' | 'closed';
  messages: Message[];
}

interface TicketChatBoxProps {
  ticket: TicketData;
  onSendReply: (text: string) => void;
}

export default function TicketChatBox({ ticket, onSendReply }: TicketChatBoxProps) {
  const [replyText, setReplyText] = useState('');

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendReply(replyText);
    setReplyText('');
  };

  return (
    <div 
      style={{ 
        border: '1px solid #e8e8e8', borderRadius: '8px', display: 'flex', 
        flexDirection: 'column', height: '420px', backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)', direction: 'rtl'
      }}
    >
      <div style={{ padding: '12px 15px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>گفتگو با {ticket.username} (موضوع: {ticket.subject})</span>
        <span style={{ fontSize: '12px', color: '#888' }}>شناسه: {ticket.id}</span>
      </div>

      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fcfcfc' }}>
        {ticket.messages.map((msg, index) => (
          <div 
            key={index} 
            style={{ 
              alignSelf: msg.sender === 'user' ? 'flex-start' : 'flex-end', 
              backgroundColor: msg.sender === 'user' ? '#f0f0f0' : '#d9f7be', 
              color: '#333', padding: '10px 14px', borderRadius: '8px', 
              maxWidth: '75%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{msg.text}</p>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', textAlign: 'left', marginTop: '5px' }}>
              {msg.time} {msg.sender === 'support' ? '(پشتیبان)' : ''}
            </span>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px', backgroundColor: '#fff', borderRadius: '0 0 8px 8px' }}>
        <input 
          type="text" 
          value={replyText} 
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="پاسخ خود را به عنوان پشتیبان بنویسید..." 
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d9d9d9', fontSize: '13px', outline: 'none' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend} 
          style={{ backgroundColor: '#52c41a', color: 'white', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
        >
          ارسال پاسخ
        </button>
      </div>
    </div>
  );
}