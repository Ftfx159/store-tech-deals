export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/api/', '/admin/'],
    },
    sitemap: 'https://orvessa.com/sitemap.xml',
  }
}
