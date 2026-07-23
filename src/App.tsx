import {
  BrowserRouter,
} from 'react-router-dom';

import AppRoutes from './config/routes';

import {
  AudioProvider,
} from './context/AudioContext';

import {
  AuthProvider,
} from './context/AuthContext';

import './features/auth-profile/auth-profile.css';
import './features/auth-profile/auth-flow.css';
import './features/auth-profile/persistence.css';

// Root application providers.
export default function App() {
  return (
    <AudioProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </AudioProvider>
  );
}