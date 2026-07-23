import { useState } from 'react';
import Button from '../../../components/Button';
import type { ReleaseType, Track } from '../types';

interface TrackFormModalProps {
  isOpen: boolean;
  artistId: string;
  onClose: () => void;
  onSubmit: (track: Track) => void;
}

export default function TrackFormModal({
  isOpen,
  artistId,
  onClose,
  onSubmit,
}: TrackFormModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReleaseType>('single');
  const [genre, setGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState('1405');
  const [lyrics, setLyrics] = useState('');
  const [collaboratorInput, setCollaboratorInput] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);

  if (!isOpen) return null;

  const addCollaborator = () => {
    if (!collaboratorInput.trim()) return;
    setCollaborators((prev) => [...prev, collaboratorInput.trim()]);
    setCollaboratorInput('');
  };

  const removeCollaborator = (index: number) => {
    setCollaborators((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit({
      id: `track-${Date.now()}`,
      artistId,
      title: title.trim(),
      type,
      coverUrl: null,
      genre: genre.trim() || 'نامشخص',
      releaseYear,
      collaborators,
      lyrics,
      listeners: 0,
      streams: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setGenre('');
    setLyrics('');
    setCollaborators([]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card track-form-modal">
        <h2>انتشار اثر جدید</h2>

        <label>
          عنوان اثر
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <div className="form-row">
          <label>
            نوع انتشار
            <select value={type} onChange={(e) => setType(e.target.value as ReleaseType)}>
              <option value="single">تک‌آهنگ</option>
              <option value="album">آلبوم</option>
            </select>
          </label>

          <label>
            سال انتشار
            <input value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} />
          </label>
        </div>

        <label>
          ژانر
          <input value={genre} onChange={(e) => setGenre(e.target.value)} />
        </label>

        <label>
          همکاران
          <div className="form-row">
            <input
              value={collaboratorInput}
              onChange={(e) => setCollaboratorInput(e.target.value)}
              placeholder="نام همکار"
            />
            <Button variant="secondary" onClick={addCollaborator}>
              افزودن
            </Button>
          </div>
        </label>

        <div className="chip-list">
          {collaborators.map((name, index) => (
            <span key={`${name}-${index}`} className="chip">
              {name}
              <button type="button" onClick={() => removeCollaborator(index)}>
                ×
              </button>
            </span>
          ))}
        </div>

        <label>
          متن آهنگ (اختیاری)
          <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={4} />
        </label>

        <label className="file-drop">
          فایل صوتی (MP3 / WAV / FLAC)
          <input type="file" accept=".mp3,.wav,.flac" />
        </label>

        <label className="file-drop">
          تصویر کاور
          <input type="file" accept="image/*" />
        </label>

        <div className="page-actions">
          <Button onClick={handleSubmit}>تایید و انتشار</Button>
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
}