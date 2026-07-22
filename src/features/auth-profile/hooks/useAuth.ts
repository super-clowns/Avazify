import { useContext } from 'react';

import { AuthContext } from '../../../context/AuthContext';

// Read the central user state.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.',
    );
  }

  return context;
}