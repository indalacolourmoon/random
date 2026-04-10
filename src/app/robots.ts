import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.org'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/editor/',
                    '/reviewer/',
                    '/author/',
                ],
            },
            {
                userAgent: ['GPTBot', 'Claude-Web', 'PerplexityBot', 'Googlebot'],
                allow: '/',
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
