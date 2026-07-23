import type { SupportTicket } from '../types';

export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'T-101',
    userId: 'user-listener-free',
    username: 'نیما راد',
    subject: 'عدم فعال‌سازی اشتراک طلایی',
    status: 'open',
    createdAt: '2026-07-20',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'من اکانت طلایی خریدم ولی هنوز برام اعمال نشده.',
        sentAt: '2026-07-20T12:30:00',
      },
    ],
  },
  {
    id: 'T-102',
    userId: 'user-listener-gold',
    username: 'سارا مرادی',
    subject: 'خطا در پخش آهنگ اختصاصی',
    status: 'closed',
    createdAt: '2026-07-16',
    messages: [
      {
        id: 'msg-2',
        sender: 'user',
        text: 'آهنگ‌ها وسط پخش قطع می‌شوند.',
        sentAt: '2026-07-16T09:15:00',
      },
      {
        id: 'msg-3',
        sender: 'support',
        text: 'مشکل شناسایی و برطرف شد، لطفاً برنامه را دوباره راه‌اندازی کنید.',
        sentAt: '2026-07-16T10:05:00',
      },
    ],
  },
];
