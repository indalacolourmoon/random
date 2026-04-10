import { getPaperById } from "@/actions/archives";
import PageHeader from "@/components/layout/PageHeader";
import PaperDetailClient from "@/features/archives/components/PaperDetailClient";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import SettingsInitializer from "@/components/providers/SettingsInitializer";
import { getPublishedPapers } from "@/actions/archives";
import { JsonLd } from "@/components/shared/JsonLd";

export async function generateStaticParams() {
    try {
        const res = await getPublishedPapers();
        if (!res.success || !res.data) return [];
        
        return res.data.map((paper: any) => ({
            id: paper.id.toString(),
        }));
    } catch (error) {
        console.error("Generate Static Params Error:", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const [paperRes, settings] = await Promise.all([
        getPaperById(id),
        getSettingsData()
    ]);
    
    const paper = paperRes.success ? paperRes.data : null;
    
    if (!paper) return { title: 'Article Not Found | IJITEST' };

    const baseUrl = settings.journal_website || 'https://ijitest.org';
    const mainAuthor = paper.author_name;
    const coAuthors = paper.co_authors ? paper.co_authors.split(',').map((s: string) => s.trim()) : [];
    const allAuthors = [mainAuthor, ...coAuthors].filter(Boolean);

    return {
        title: `${paper.title} | IJITEST Archive`,
        description: paper.abstract?.substring(0, 160) + "...",
        keywords: paper.keywords,
        openGraph: {
            title: paper.title,
            description: paper.abstract?.substring(0, 160),
            type: 'article',
            authors: allAuthors,
        },
        other: {
            // Highwire Press (Google Scholar)
            'citation_title': paper.title,
            'citation_author': allAuthors,
            'citation_publication_date': paper.published_at ? new Date(paper.published_at).toISOString().split('T')[0].replace(/-/g, '/') : (paper.publication_year?.toString() || ''),
            'citation_journal_title': settings.journal_name || 'International Journal of Information Technology (IJITEST)',
            'citation_volume': paper.volume_number?.toString() || '',
            'citation_issue': paper.issue_number?.toString() || '',
            'citation_firstpage': paper.start_page?.toString() || '',
            'citation_lastpage': paper.end_page?.toString() || '',
            'citation_pdf_url': paper.pdf_url ? (paper.pdf_url.startsWith('http') ? paper.pdf_url : `${baseUrl}${paper.pdf_url}`) : '',
            
            // Dublin Core
            'dc.title': paper.title || '',
            'dc.creator': allAuthors,
            'dc.date': paper.published_at ? new Date(paper.published_at).toISOString().split('T')[0] : (paper.publication_year?.toString() || ''),
            'dc.subject': paper.keywords || '',
            'dc.description': paper.abstract || '',
        }
    };
}


export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [paperRes, settings] = await Promise.all([
        getPaperById(id),
        getSettingsData()
    ]);
    
    const paper = paperRes.success ? paperRes.data : null;

    if (!paper) notFound();

    const baseUrl = settings.journal_website || 'https://ijitest.org';
    const mainAuthor = paper.author_name;
    const coAuthors = paper.co_authors ? paper.co_authors.split(',').map((s: string) => s.trim()) : [];
    const allAuthors = [mainAuthor, ...coAuthors].filter(Boolean);

    return (
        <div className="bg-white min-h-screen pb-20">
            <SettingsInitializer settings={settings} />
            <PageHeader
                title="Research Article"
                description={paper.paper_id}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Archives', href: '/archives' },
                    { name: paper.paper_id, href: `/archives/${id}` },
                ]}
            />
            <PaperDetailClient paper={paper} id={id} />
            
            <JsonLd 
                id="scholarly-article"
                data={{
                    "@context": "https://schema.org",
                    "@type": "ScholarlyArticle",
                    "headline": paper.title,
                    "description": paper.abstract,
                    "author": allAuthors.map(author => ({
                        "@type": "Person",
                        "name": author
                    })),
                    "datePublished": paper.published_at ? new Date(paper.published_at).toISOString() : (paper.publication_year?.toString() || ""),
                    "publisher": {
                        "@type": "Organization",
                        "name": settings.journal_name || "IJITEST",
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${baseUrl}/favicon_io/apple-touch-icon.png`
                        }
                    },
                    "isPartOf": {
                        "@type": "ScholarlyJournal",
                        "name": settings.journal_name || "IJITEST",
                        "issn": ""
                    },
                    "pageStart": paper.start_page?.toString(),
                    "pageEnd": paper.end_page?.toString(),
                    "volumeNumber": paper.volume_number?.toString(),
                    "issueNumber": paper.issue_number?.toString(),
                    "keywords": paper.keywords,
                    "url": `${baseUrl}/archives/${id}`,
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `${baseUrl}/archives/${id}`
                    }
                }}
            />
        </div>
    );
}
