import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './config/routes';
import { AudioProvider } from './context/AudioContext';

// Root application providers.
export default function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AudioProvider>
  );
}