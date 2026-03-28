import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.org'

    return {
        rules: {
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
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
