import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Keep internal APIs hidden from crawlers
    },
    sitemap: 'https://hyhilman.web.id/preday/sitemap.xml',
  }
}
