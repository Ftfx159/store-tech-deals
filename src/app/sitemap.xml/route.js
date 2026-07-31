import { prisma } from '@/lib/prisma';

export async function GET() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ftfxtechdeals.com';

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        lastUpdated: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
      // Limit to 1000 for sitemap performance, scale with sitemap indexes later if needed
      take: 1000, 
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/search</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${products
    .map((product) => {
      return `
  <url>
    <loc>${SITE_URL}/product/${product.id}</loc>
    <lastmod>${new Date(product.lastUpdated).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
      `;
    })
    .join('')}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
