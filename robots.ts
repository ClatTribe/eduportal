import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/dashboard',
        '/profile',
        '/account',
        '/login',
        '/register',
        '/api/',
      ],
    },
    sitemap: 'https://app.goeduabroad.com/sitemap.xml',
  };
}
