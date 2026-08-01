import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import { formatDuration } from '../domain/phase1.js';
import type { Track } from '../types';

interface TrackFormState {
  title: string;
  releaseType: 'single' | 'album';
  albumTitle: string;
  genre: string;
  releaseDate: string;
  duration: number;
  lyrics: string;
  collaboratorsText: string;
  cover: string;
  audioFileName: string;
  audioFile: File | null;
  coverFile: File | null;
  earlyAccess: boolean;
}

const emptyForm: TrackFormState = {
  title: '',
  releaseType: 'single',
  albumTitle: '',
  genre: 'پاپ',
  releaseDate: new Date().toISOString().slice(0, 10),
  duration: 180,
  lyrics: '',
  collaboratorsText: '',
  cover: '/covers/solaris.svg',
  audioFileName: '',
  audioFile: null,
  coverFile: null,
  earlyAccess: false,
};

function TrackFormModal({ open, track, onClose }: { open: boolean; track: Track | null; onClose: () => void }) {
  const { saveArtistTrack } = useAppState();
  const { pushToast } = useToast();
  const [form, setForm] = useState<TrackFormState>(emptyForm);

  useEffect(() => {
    setForm(track ? {
      title: track.title,
      releaseType: track.albumId ? 'album' : 'single',
      albumTitle: track.albumTitle ?? '',
      genre: track.genre,
      releaseDate: track.releaseDate,
      duration: track.duration,
      lyrics: track.lyrics,
      collaboratorsText: track.collaborators.join('، '),
      cover: track.cover,
      audioFileName: 'فایل صوتی فعلی',
      audioFile: null,
      coverFile: null,
      earlyAccess: track.earlyAccess,
    } : emptyForm);
  }, [track, open]);

  const handleCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return pushToast('حجم کاور باید کمتر از ۲ مگابایت باشد.', 'error');
    const reader = new FileReader();
    reader.onload = () => setForm((previous) => ({ ...previous, cover: String(reader.result), coverFile: file }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.genre.trim() || !form.releaseDate) return pushToast('عنوان، سبک و تاریخ انتشار ضروری است.', 'error');
    if (!track && !form.audioFileName) return pushToast('یک فایل صوتی MP3، WAV یا FLAC انتخاب کنید.', 'error');
    if (form.releaseType === 'album' && !form.albumTitle.trim()) return pushToast('برای انتشار آلبومی، نام آلبوم را وارد کنید.', 'error');
    const result = await saveArtistTrack({
      id: track?.id,
      title: form.title,
      albumTitle: form.releaseType === 'album' ? form.albumTitle : '',
      genre: form.genre,
      releaseDate: form.releaseDate,
      duration: form.duration,
      lyrics: form.lyrics,
      collaborators: form.collaboratorsText.split(/[،,]/).map((item) => item.trim()).filter(Boolean),
      cover: form.cover,
      coverFile: form.coverFile,
      audioFile: form.audioFile,
      earlyAccess: form.earlyAccess,
    });
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) onClose();
  };

  return (
    <Modal open={open} title={track ? 'ویرایش اثر' : 'انتشار اثر جدید'} description="اطلاعات متا، کاور، فایل صوتی و متن آهنگ را کامل کنید." onClose={onClose} size="large" footer={<><button type="button" className="button button-ghost" onClick={onClose}>انصراف</button><button type="submit" form="track-form" className="button button-primary">{track ? 'ذخیره تغییرات' : 'انتشار اثر'}</button></>}>
      <form id="track-form" className="studio-form" onSubmit={handleSubmit}>
        <div className="studio-form-cover">
          <img src={form.cover} alt="پیش‌نمایش کاور" />
          <label className="button button-secondary small"><Icon name="image" /> انتخاب کاور<input type="file" accept="image/*" onChange={handleCover} /></label>
          <small>تصویر مربع با حجم کمتر از ۲ مگابایت</small>
        </div>
        <div className="studio-form-fields form-grid two-columns">
          <label className="field"><span className="field-label">عنوان اثر</span><span className="field-control"><Icon name="music" /><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></span></label>
          <label className="field"><span className="field-label">نوع انتشار</span><span className="field-control"><Icon name="album" /><select value={form.releaseType} onChange={(event) => setForm({ ...form, releaseType: event.target.value === 'album' ? 'album' : 'single' })}><option value="single">تک‌آهنگ</option><option value="album">بخشی از آلبوم</option></select></span></label>
          {form.releaseType === 'album' ? <label className="field"><span className="field-label">نام آلبوم</span><span className="field-control"><Icon name="album" /><input value={form.albumTitle} onChange={(event) => setForm({ ...form, albumTitle: event.target.value })} /></span></label> : null}
          <label className="field"><span className="field-label">سبک</span><span className="field-control"><Icon name="filter" /><input list="genres" value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value })} /><datalist id="genres"><option value="پاپ"/><option value="الکترونیک"/><option value="تلفیقی"/><option value="آکوستیک"/><option value="بی‌کلام"/></datalist></span></label>
          <label className="field"><span className="field-label">تاریخ انتشار</span><span className="field-control"><Icon name="calendar" /><input type="date" value={form.releaseDate} onChange={(event) => setForm({ ...form, releaseDate: event.target.value })} /></span></label>
          <label className="field"><span className="field-label">مدت آهنگ (ثانیه)</span><span className="field-control"><Icon name="clock" /><input dir="ltr" type="number" min={10} max={1800} value={form.duration} onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })} /></span></label>
          <label className="field form-span-two"><span className="field-label">هنرمندان همکار</span><span className="field-control"><Icon name="users" /><input value={form.collaboratorsText} onChange={(event) => setForm({ ...form, collaboratorsText: event.target.value })} placeholder="نام‌ها را با ویرگول جدا کنید" /></span></label>
          <label className="privacy-check form-span-two"><input type="checkbox" checked={form.earlyAccess} onChange={(event) => setForm({ ...form, earlyAccess: event.target.checked })} /><span>انتشار به‌صورت دسترسی زودهنگام برای کاربران طلایی</span></label>
          <label className="audio-upload form-span-two">
            <input type="file" accept="audio/mpeg,audio/wav,audio/flac,.mp3,.wav,.flac" onChange={(event) => { const file = event.target.files?.[0] ?? null; setForm({ ...form, audioFileName: file?.name ?? '', audioFile: file }); }} />
            <span className="upload-field-icon"><Icon name="upload" /></span>
            <span><strong>{form.audioFileName || 'فایل صوتی اثر'}</strong><small>فرمت‌های MP3، WAV و FLAC؛ فایل اصلی روی سرور ذخیره می‌شود.</small></span>
            <span className="button button-secondary small">انتخاب فایل</span>
          </label>
          <label className="field form-span-two"><span className="field-label">متن آهنگ</span><span className="field-control textarea-control"><textarea rows={7} value={form.lyrics} onChange={(event) => setForm({ ...form, lyrics: event.target.value })} placeholder="هر مصرع را در خط جداگانه بنویسید." /></span></label>
        </div>
      </form>
    </Modal>
  );
}

export default function ArtistStudioPage() {
  const { data, currentUser, deleteArtistTrack } = useAppState();
  const { pushToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  const tracks = useMemo(() => data.tracks.filter((track) => track.artistId === currentUser?.id), [currentUser?.id, data.tracks]);
  const listeners = tracks.reduce((sum, track) => sum + track.listeners, 0);
  const streams = tracks.reduce((sum, track) => sum + track.streams, 0);
  const finance = data.finance.find((record) => record.artistId === currentUser?.id);

  if (!currentUser || currentUser.role !== 'artist') return null;

  if (currentUser.artistStatus !== 'approved') {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="پنل هنرمند" title="مدیریت آثار" description="پس از تأیید حساب هنرمند، امکانات انتشار و گزارش‌گیری فعال می‌شوند." />
        <section className="verification-wait-card">
          <span className="verification-illustration"><Icon name={currentUser.artistStatus === 'rejected' ? 'warning' : 'clock'} size={48} /></span>
          <h2>{currentUser.artistStatus === 'rejected' ? 'درخواست هنرمندی تأیید نشد' : 'درخواست شما در حال بررسی است'}</h2>
          <p>{currentUser.artistStatus === 'rejected' ? 'برای ارسال نمونه‌کار جدید با پشتیبانی تماس بگیرید.' : 'تیم پشتیبانی نمونه‌کارهای ثبت‌شده را بررسی می‌کند و نتیجه از طریق اعلانات اعلام خواهد شد.'}</p>
          <Link className="button button-secondary" to="/notifications">مشاهده اعلانات</Link>
        </section>
      </div>
    );
  }

  const confirmDelete = async () => {
    if (!deletingTrack) return;
    const result = await deleteArtistTrack(deletingTrack.id);
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) setDeletingTrack(null);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="پنل هنرمند" title="مدیریت آثار" description="انتشار، ویرایش و حذف آثار همراه با مشاهده آمار شنونده، استریم و درآمد." actions={<button type="button" className="button button-primary" onClick={() => { setEditingTrack(null); setFormOpen(true); }}><Icon name="upload" /> انتشار اثر جدید</button>} />

      <section className="stats-grid four">
        <article className="stat-card"><span className="stat-icon purple"><Icon name="music" /></span><div><small>آثار منتشرشده</small><strong>{tracks.length.toLocaleString('fa-IR')}</strong></div><span className="stat-caption">آلبوم و تک‌آهنگ</span></article>
        <article className="stat-card"><span className="stat-icon blue"><Icon name="users" /></span><div><small>مجموع شنوندگان</small><strong>{listeners.toLocaleString('fa-IR')}</strong></div><span className="stat-caption">در تمام آثار</span></article>
        <article className="stat-card"><span className="stat-icon pink"><Icon name="play" /></span><div><small>مجموع استریم‌ها</small><strong>{streams.toLocaleString('fa-IR')}</strong></div><span className="stat-caption">ماه جاری</span></article>
        <article className="stat-card"><span className="stat-icon amber"><Icon name="wallet" /></span><div><small>درآمد محاسبه‌شده</small><strong>{(finance?.reward ?? 0).toLocaleString('fa-IR')}</strong></div><span className="stat-caption">تومان · {finance?.status === 'settled' ? 'تسویه‌شده' : 'در انتظار پرداخت'}</span></article>
      </section>

      <section className="content-card studio-catalog">
        <div className="card-heading"><div><span className="eyebrow">کاتالوگ من</span><h2>آثار منتشرشده</h2><p>اطلاعات متا، کاور و متن هر اثر از این بخش قابل ویرایش است.</p></div></div>
        {tracks.length ? (
          <div className="responsive-table-wrap">
            <table className="data-table studio-table">
              <thead><tr><th>اثر</th><th>نوع</th><th>انتشار</th><th>شنونده</th><th>استریم</th><th>مدت</th><th>عملیات</th></tr></thead>
              <tbody>{tracks.map((track) => <tr key={track.id}><td><div className="table-media"><img src={track.cover} alt="" /><span><strong>{track.title}</strong><small>{track.genre}</small></span></div></td><td><span className="table-badge">{track.albumId ? 'آلبوم' : 'تک‌آهنگ'}</span></td><td>{new Intl.DateTimeFormat('fa-IR').format(new Date(track.releaseDate))}</td><td>{track.listeners.toLocaleString('fa-IR')}</td><td>{track.streams.toLocaleString('fa-IR')}</td><td>{formatDuration(track.duration)}</td><td><div className="table-actions"><button type="button" className="icon-button subtle" onClick={() => { setEditingTrack(track); setFormOpen(true); }} aria-label="ویرایش"><Icon name="edit" size={17} /></button><button type="button" className="icon-button subtle danger-hover" onClick={() => setDeletingTrack(track)} aria-label="حذف"><Icon name="trash" size={17} /></button></div></td></tr>)}</tbody>
            </table>
          </div>
        ) : <EmptyState icon="upload" title="هنوز اثری منتشر نکرده‌اید" description="اولین فایل صوتی خود را همراه با کاور و اطلاعات انتشار ثبت کنید." action={<button type="button" className="button button-primary" onClick={() => setFormOpen(true)}>انتشار اولین اثر</button>} />}
      </section>

      <TrackFormModal open={formOpen} track={editingTrack} onClose={() => { setFormOpen(false); setEditingTrack(null); }} />
      <Modal open={deletingTrack !== null} title="حذف اثر منتشرشده" onClose={() => setDeletingTrack(null)} size="small" footer={<><button type="button" className="button button-ghost" onClick={() => setDeletingTrack(null)}>انصراف</button><button type="button" className="button button-danger" onClick={confirmDelete}>حذف اثر</button></>}><div className="confirm-content"><span className="confirm-icon danger"><Icon name="trash" /></span><p>اثر «{deletingTrack?.title}» از کاتالوگ، آلبوم مربوط و پلی‌لیست‌های کاربران حذف می‌شود.</p></div></Modal>
    </div>
  );
}
