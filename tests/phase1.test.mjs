import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateReward,
  canCreatePlaylist,
  createUsername,
  cycleRepeat,
  filterTracks,
  formatDuration,
  getDailyStreamLimit,
  getPlaylistLimit,
  markAllRead,
  nextQueueIndex,
  normalizeEmail,
  removeNotification,
  sortTracks,
  toggleId,
} from '../src/domain/phase1.js';

const tracks = [
  { id: '1', title: 'شهر نئون', artistName: 'نیلا', albumTitle: 'نیمه شب', genre: 'الکترونیک', listeners: 120, releaseDate: '2026-07-18' },
  { id: '2', title: 'باران اول', artistName: 'رویا', albumTitle: null, genre: 'آکوستیک', listeners: 80, releaseDate: '2026-05-21' },
  { id: '3', title: 'باد شمال', artistName: 'کیان', albumTitle: 'جاده باز', genre: 'تلفیقی', listeners: 200, releaseDate: '2026-06-29' },
];

test('ایمیل برای احراز هویت یکدست می‌شود', () => {
  assert.equal(normalizeEmail('  Demo@Example.COM '), 'demo@example.com');
});

test('نام کاربری پایه از ایمیل ساخته می‌شود', () => {
  assert.equal(createUsername('Test.User@example.com'), 'test_user');
});

test('نام کاربری تکراری پسوند یکتا می‌گیرد', () => {
  assert.equal(createUsername('test@example.com', ['test', 'test_2']), 'test_3');
});

test('محدودیت پلی‌لیست اشتراک پایه برابر ۶ است', () => {
  assert.equal(getPlaylistLimit('free'), 6);
});

test('محدودیت پلی‌لیست اشتراک نقره‌ای برابر ۱۰۰ است', () => {
  assert.equal(getPlaylistLimit('silver'), 100);
});

test('اشتراک طلایی محدودیت پلی‌لیست ندارد', () => {
  assert.equal(getPlaylistLimit('gold'), null);
});

test('ساخت پلی‌لیست پس از رسیدن به سقف پایه رد می‌شود', () => {
  assert.equal(canCreatePlaylist('free', 6), false);
  assert.equal(canCreatePlaylist('free', 5), true);
});

test('محدودیت استریم روزانه فقط برای اشتراک پایه فعال است', () => {
  assert.equal(getDailyStreamLimit('free'), 60);
  assert.equal(getDailyStreamLimit('silver'), null);
  assert.equal(getDailyStreamLimit('gold'), null);
});

test('دنبال‌کردن و لغو دنبال‌کردن با toggleId انجام می‌شود', () => {
  assert.deepEqual(toggleId(['a'], 'b'), ['a', 'b']);
  assert.deepEqual(toggleId(['a', 'b'], 'a'), ['b']);
});

test('جستجوی آهنگ هم نام اثر و هم نام هنرمند را پوشش می‌دهد', () => {
  assert.deepEqual(filterTracks(tracks, 'نیلا').map((item) => item.id), ['1']);
  assert.deepEqual(filterTracks(tracks, 'باران').map((item) => item.id), ['2']);
});

test('فیلتر سبک همراه با جستجو اعمال می‌شود', () => {
  assert.deepEqual(filterTracks(tracks, '', 'تلفیقی').map((item) => item.id), ['3']);
});

test('مرتب‌سازی براساس شنونده نزولی است', () => {
  assert.deepEqual(sortTracks(tracks, 'listeners').map((item) => item.id), ['3', '1', '2']);
});

test('مرتب‌سازی تاریخ، آرایه اصلی را تغییر نمی‌دهد', () => {
  const before = tracks.map((item) => item.id);
  assert.deepEqual(sortTracks(tracks, 'latest').map((item) => item.id), ['1', '3', '2']);
  assert.deepEqual(tracks.map((item) => item.id), before);
});

test('خواندن همه اعلان‌ها بدون حذف اطلاعات انجام می‌شود', () => {
  const result = markAllRead([{ id: 'n1', read: false }, { id: 'n2', read: true }]);
  assert.equal(result.every((item) => item.read), true);
  assert.deepEqual(result.map((item) => item.id), ['n1', 'n2']);
});

test('حذف اعلان فقط مورد انتخاب‌شده را پاک می‌کند', () => {
  assert.deepEqual(removeNotification([{ id: 'n1' }, { id: 'n2' }], 'n1'), [{ id: 'n2' }]);
});

test('حرکت صف پخش در حالت تکرار کل از انتها به ابتدا برمی‌گردد', () => {
  assert.equal(nextQueueIndex(2, 3, 'all', 1), 0);
  assert.equal(nextQueueIndex(0, 3, 'all', -1), 2);
});

test('حرکت صف بدون تکرار در مرز متوقف می‌شود', () => {
  assert.equal(nextQueueIndex(2, 3, 'off', 1), -1);
});

test('تکرار تک‌آهنگ همان اندیس را نگه می‌دارد', () => {
  assert.equal(nextQueueIndex(1, 3, 'one', 1), 1);
});

test('چرخه حالت تکرار کامل است', () => {
  assert.equal(cycleRepeat('off'), 'all');
  assert.equal(cycleRepeat('all'), 'one');
  assert.equal(cycleRepeat('one'), 'off');
});

test('مدت آهنگ با اعداد فارسی قالب‌بندی می‌شود', () => {
  assert.equal(formatDuration(194), '۳:۱۴');
  assert.equal(formatDuration(-1), '۰:۰۰');
});

test('پاداش هنرمند طبق تابع ماک محاسبه می‌شود', () => {
  assert.equal(calculateReward(100, 200), 6200);
});
