import { useState } from 'react';
import { mockSupportTickets } from '../data/mockSupportTickets';
import type { SupportTicket } from '../types';

export default function SupportTicketsPanel() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  const sendReply = () => {
    if (!selected || !reply.trim()) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? {
              ...t,
              status: 'answered',
              messages: [
                ...t.messages,
                {
                  id: `msg-${Date.now()}`,
                  sender: 'support',
                  text: reply.trim(),
                  sentAt: new Date().toISOString(),
                },
              ],
            }
          : t,
      ),
    );
    setReply('');
  };

  return (
    <div className="tickets-panel">
      <table className="data-table">
        <thead>
          <tr>
            <th>شناسه</th>
            <th>کاربر</th>
            <th>موضوع</th>
            <th>تاریخ</th>
            <th>وضعیت</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className={ticket.id === selectedId ? 'data-row-selected' : ''}
              onClick={() => setSelectedId(ticket.id)}
            >
              <td>{ticket.id}</td>
              <td>{ticket.username}</td>
              <td>{ticket.subject}</td>
              <td>{ticket.createdAt}</td>
              <td>
                <span className={`status-pill status-pill-${ticket.status}`}>
                  {ticket.status === 'open'
                    ? 'باز'
                    : ticket.status === 'answered'
                    ? 'پاسخ داده شده'
                    : 'بسته شده'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected ? (
        <div className="ticket-chat-box">
          <div className="ticket-chat-messages">
            {selected.messages.map((msg) => (
              <p key={msg.id} className={`chat-bubble chat-bubble-${msg.sender}`}>
                {msg.text}
              </p>
            ))}
          </div>

          <div className="ticket-chat-input">
            <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="پاسخ خود را بنویسید..." />
            <button type="button" onClick={sendReply}>
              ارسال
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}