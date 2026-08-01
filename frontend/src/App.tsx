import { BrowserRouter } from 'react-router-dom';

import ToastViewport from './components/ToastViewport';
import { AppStateProvider } from './context/AppStateContext';
import { PlayerProvider } from './context/PlayerContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppStateProvider>
          <PlayerProvider>
            <AppRoutes />
            <ToastViewport />
          </PlayerProvider>
        </AppStateProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
