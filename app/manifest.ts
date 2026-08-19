import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Barnes Bowling Club',
    short_name: 'Barnes Bowls',
    description: 'Barnes Bowling Club — fixtures, competitions, notices, gallery and members area.',
    id: '/club-app',
    start_url: '/club-app',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f0e8',
    theme_color: '#1b3b2a',
    orientation: 'portrait-primary',
    categories: ['sports', 'social'],
    icons: [
      {
        src: '/icons/bbc-app-icon-v4-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/bbc-app-icon-v4-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/bbc-app-icon-v4-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
