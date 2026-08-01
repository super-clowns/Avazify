import type { UserRole } from '../types';

export interface DemoAccount {
  label: string;
  email: string;
  role: UserRole;
}

export const demoAccounts: DemoAccount[] = [
  { label: 'شنونده پایه', email: 'sara@example.com', role: 'listener' },
  { label: 'شنونده طلایی', email: 'arman@example.com', role: 'listener' },
  { label: 'هنرمند تأییدشده', email: 'nila.artist@example.com', role: 'artist' },
  { label: 'هنرمند در انتظار', email: 'ava.pending@example.com', role: 'artist' },
  { label: 'پشتیبان', email: 'support@example.com', role: 'support' },
  { label: 'مدیر سامانه', email: 'admin@example.com', role: 'admin' },
];
