import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://hyhilman.web.id/preday',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://hyhilman.web.id/preday/dashboard',
      lastModified: new Date(),
      changeFrequency: 'always', // Dashboard state changes frequently for users
      priority: 0.8,
    },
  ]
}
