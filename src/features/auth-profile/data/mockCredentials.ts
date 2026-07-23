import type { MockCredential } from '../types';

export const DEMO_PASSWORD = 'Demo1234!';

// Mock credentials are for frontend testing only.
export const mockCredentials: MockCredential[] = [
  {
    userId: 'user-listener-free',
    email: 'nima.listener@avazify.local',
    password: DEMO_PASSWORD,
  },
  {
    userId: 'user-listener-gold',
    email: 'sara.gold@avazify.local',
    password: DEMO_PASSWORD,
  },
  {
    userId: 'user-artist-approved',
    email: 'luna.artist@avazify.local',
    password: DEMO_PASSWORD,
  },
  {
    userId: 'user-support',
    email: 'arman.support@avazify.local',
    password: DEMO_PASSWORD,
  },
  {
    userId: 'user-admin',
    email: 'admin@avazify.local',
    password: DEMO_PASSWORD,
  },
];

export interface DemoLoginOption {
  label: string;
  description: string;
  email: string;
  password: string;
}

export const demoLoginOptions: DemoLoginOption[] = [
  {
    label: 'شنونده پایه',
    description: 'کاربر عادی با محدودیت‌های اشتراک رایگان',
    email: 'nima.listener@avazify.local',
    password: DEMO_PASSWORD,
  },
  {
    label: 'شنونده طلایی',
    description: 'کاربر عادی با دسترسی زودهنگام',
    email: 'sara.gold@avazify.local',
    password: DEMO_PASSWORD,
  },
  {
    label: 'هنرمند تأییدشده',
    description: 'دارای دسترسی به مدیریت آثار',
    email: 'luna.artist@avazify.local',
    password: DEMO_PASSWORD,
  },
  {
    label: 'پشتیبان',
    description: 'دارای دسترسی به داشبورد پشتیبانی',
    email: 'arman.support@avazify.local',
    password: DEMO_PASSWORD,
  },
  {
    label: 'مدیر سامانه',
    description: 'دارای دسترسی کامل مدیریتی',
    email: 'admin@avazify.local',
    password: DEMO_PASSWORD,
  },
];