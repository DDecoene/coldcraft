import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://coldcraft.rgwnd.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://coldcraft.rgwnd.app/success', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]
}
