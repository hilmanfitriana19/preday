import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PredaY | Reminder System',
    short_name: 'PredaY',
    description: 'The Proactive H-1 Telegram Reminder & Loop System',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#0088cc',
    icons: [
      {
        src: '/preday/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/preday/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/preday/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
