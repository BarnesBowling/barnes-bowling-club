import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Barnes Bowling Club',
    short_name: 'Barnes Bowls',
    description: 'Barnes Bowling Club — fixtures, competitions, notices, gallery and members area.',
    start_url: '/club-app',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f0e8',
    theme_color: '#1b3b2a',
    orientation: 'portrait-primary',
    categories: ['sports', 'social'],
    icons: [
      {
        src: '/icons/bbc-app-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/bbc-app-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
