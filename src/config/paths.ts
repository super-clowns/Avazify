// Central application paths.
export const APP_PATHS = {
  root: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  home: '/home',
  profile: '/profile',
  settings: '/settings',
  notifications: '/notifications',
  playlists: '/playlists',
  archive: '/archive',
  artistManagement: '/artist/manage',
  dashboard: '/dashboard',
  album: (albumId: string) => `/album/${albumId}`,
  profileByUsername: (username: string) => `/profile/${username}`,
  artistById: (artistId: string) => `/artist/${artistId}`,
} as const;