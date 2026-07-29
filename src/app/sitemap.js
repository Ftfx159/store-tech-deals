export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function sitemap() {
  const baseUrl = "https://ftfxtechdeals.com";

  let products = [];
  try {
    products = await prisma.product.findMany({
      select: {
        id: true,
        lastUpdated: true,
      }
    });
  } catch(e) {
    console.error("Sitemap generation failed to fetch products:", e);
  }

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.lastUpdated,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

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
    }
  ];

  return [...staticRoutes, ...productRoutes];
}
