import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'], // Keep internal APIs and personal dashboards hidden from crawlers
    },
    sitemap: 'https://hyhilman.web.id/preday/sitemap.xml',
  }
}
