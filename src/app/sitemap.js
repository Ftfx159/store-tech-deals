export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = "https://ftfxtechdeals.com"; // Replace with actual domain

  // We would normally fetch products dynamically to generate URLs here
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  return staticRoutes;
}
