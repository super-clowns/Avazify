import type { Track, Album } from '../features/music/types';

export const mockTracks: Track[] = [
  { id: 't1', title: 'امضا', artist: 'سهراب پاکزاد', artistId: 'a1', cover: '', duration: 204, genre: 'پاپ', lyrics: 'امضا کردن دوباره تو رو من…', plays: 420000, listeners: 32000, audioUrl: '/audio/sample1.mp3', year: '۱۴۰۵' },
  { id: 't2', title: 'گل بی نقص', artist: 'سهراب پاکزاد', artistId: 'a1', album: 'گل بی نقص', albumId: 'al1', cover: '', duration: 190, genre: 'پاپ', plays: 680000, listeners: 45000, audioUrl: '/audio/sample2.mp3', year: '۱۴۰۴' },
  { id: 't3', title: 'نور چشمی', artist: 'سهراب پاکزاد', artistId: 'a1', cover: '', duration: 175, genre: 'پاپ', plays: 310000, listeners: 28000, audioUrl: '/audio/sample3.mp3', year: '۱۴۰۴' },
  { id: 't4', title: 'بهت قول میدم', artist: 'حمید هیراد', artistId: 'a2', cover: '', duration: 220, genre: 'پاپ', lyrics: 'بهت قول میدم نذارم تنها بمونی…', plays: 890000, listeners: 67000, audioUrl: '/audio/sample4.mp3', year: '۱۴۰۳' },
  { id: 't5', title: 'باران', artist: 'علیرضا قربانی', artistId: 'a3', album: 'باران', albumId: 'al2', cover: '', duration: 245, genre: 'سنتی', plays: 750000, listeners: 54000, audioUrl: '/audio/sample5.mp3', year: '۱۴۰۲' },
  { id: 't6', title: 'شب سرد', artist: 'علیرضا قربانی', artistId: 'a3', cover: '', duration: 198, genre: 'سنتی', plays: 520000, listeners: 41000, audioUrl: '/audio/sample6.mp3', year: '۱۴۰۳' },
  { id: 't7', title: 'دلبر', artist: 'همایون شجریان', artistId: 'a4', album: 'دلبر', albumId: 'al3', cover: '', duration: 232, genre: 'سنتی', lyrics: 'دلبر من دلبر من…', plays: 920000, listeners: 71000, audioUrl: '/audio/sample7.mp3', year: '۱۴۰۱' },
  { id: 't8', title: 'یا رب', artist: 'همایون شجریان', artistId: 'a4', cover: '', duration: 210, genre: 'سنتی', plays: 610000, listeners: 48000, audioUrl: '/audio/sample8.mp3', year: '۱۴۰۲' },
  { id: 't9', title: 'آخرین فرصت', artist: 'ماکان بند', artistId: 'a5', cover: '', duration: 195, genre: 'پاپ', plays: 1200000, listeners: 95000, audioUrl: '/audio/sample9.mp3', year: '۱۴۰۴' },
  { id: 't10', title: 'دل دیوونه', artist: 'ماکان بند', artistId: 'a5', album: 'دل دیوونه', albumId: 'al4', cover: '', duration: 188, genre: 'پاپ', plays: 980000, listeners: 78000, audioUrl: '/audio/sample10.mp3', year: '۱۴۰۳' },
];

export const mockAlbums: Album[] = [
  {
    id: 'al1', title: 'گل بی نقص', artist: 'سهراب پاکزاد', artistId: 'a1', cover: '',
    year: '۱۴۰۴', genre: 'پاپ',
    tracks: mockTracks.filter(t => t.albumId === 'al1'),
    plays: 1200000, listeners: 85000,
  },
  {
    id: 'al2', title: 'باران', artist: 'علیرضا قربانی', artistId: 'a3', cover: '',
    year: '۱۴۰۲', genre: 'سنتی',
    tracks: mockTracks.filter(t => t.albumId === 'al2'),
    plays: 1800000, listeners: 120000,
  },
  {
    id: 'al3', title: 'دلبر', artist: 'همایون شجریان', artistId: 'a4', cover: '',
    year: '۱۴۰۱', genre: 'سنتی',
    tracks: mockTracks.filter(t => t.albumId === 'al3'),
    plays: 2100000, listeners: 150000,
  },
  {
    id: 'al4', title: 'دل دیوونه', artist: 'ماکان بند', artistId: 'a5', cover: '',
    year: '۱۴۰۳', genre: 'پاپ',
    tracks: mockTracks.filter(t => t.albumId === 'al4'),
    plays: 1600000, listeners: 110000,
  },
];

export const mockFeaturedTracks = mockTracks.slice(0, 5);
export const mockNewReleases = mockTracks.slice(5, 10);
