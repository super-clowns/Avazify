import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AudioProvider } from './context/AudioContext';
import MusicPlayerBar from './features/music/components/MusicPlayer/MusicPlayerBar';
import PlaylistsPage from './features/music/pages/PlaylistsPage';
import ArchivePage from './features/music/pages/ArchivePage';
import AlbumDetailsPage from './features/music/pages/AlbumDetailsPage';

import ArtistProfile from './features/admin-artist/pages/ArtistProfilePage';
import ArtistConsole from './features/admin-artist/pages/ArtistManagementPage';
import Notifications from './features/admin-artist/pages/NotificationsPage';

import DashboardLayout from './features/admin-artist/pages/DashboardPage';
import TicketsAndAuth from './features/admin-artist/components/AdminDashboard/TicketsAndAuth';
import Auditing from './features/admin-artist/components/AdminDashboard/AuditTable';
import SubscriptionManagement from './features/admin-artist/components/AdminDashboard/PriceControlForm';

export default function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/test/artist" element={<ArtistProfile />} />
          <Route path="/test/artist-console" element={<ArtistConsole />} />
          <Route path="/test/notifications" element={<Notifications />} />

          <Route path="/playlists" element={<><PlaylistsPage /><MusicPlayerBar /></>} />
          <Route path="/archive" element={<><ArchivePage /><MusicPlayerBar /></>} />
          <Route path="/album/:albumId" element={<><AlbumDetailsPage /><MusicPlayerBar /></>} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="tickets" replace />} />
            <Route path="tickets" element={<TicketsAndAuth />} />
            <Route path="auditing" element={<Auditing userRole="admin" />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/playlists" replace />} />
        </Routes>
      </BrowserRouter>
    </AudioProvider>
  );
}
