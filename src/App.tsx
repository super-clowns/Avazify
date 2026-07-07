import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ArtistProfile from './pages/ArtistProfile';
import ArtistConsole from './pages/ArtistConsole';
import Notifications from './pages/Notifications';

import DashboardLayout from './pages/Dashboard/DashboardLayout';
import TicketsAndAuth from './pages/Dashboard/TicketsAndAuth';
import Auditing from './pages/Dashboard/Auditing';
import SubscriptionManagement from './pages/Dashboard/SubscriptionManagement';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test/artist" element={<ArtistProfile />} />
        
        <Route path="/test/artist-console" element={<ArtistConsole />} />
        
        <Route path="/test/notifications" element={<Notifications />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="tickets" replace />} />
          
          <Route path="tickets" element={<TicketsAndAuth />} />
          <Route path="auditing" element={<Auditing userRole="admin" />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}