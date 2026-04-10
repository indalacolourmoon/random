import { getSettingsData } from '@/actions/settings';
import { Metadata } from 'next';
import HomeCarousel from '@/features/home/components/HomeCarousel';
import WelcomeSection from '@/features/home/components/WelcomeSection';
import HomeStats from '@/features/home/components/HomeStats';
import AimAndScope from '@/features/home/components/AimAndScope';
import AnnouncementsWidget from '@/features/shared/widgets/AnnouncementsWidget';
import CurrentIssueWidget from '@/features/shared/widgets/CurrentIssueWidget';
import PublisherSection from '@/features/home/components/PublisherSection';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import AuthorQuickLinks from '@/features/home/components/AuthorQuickLinks';
import CallForPapersWidget from '@/features/shared/widgets/CallForPapersWidget';
import ResourceDeskWidget from '@/features/shared/widgets/ResourceDeskWidget';
import EthicsWidget from '@/features/shared/widgets/EthicsWidget';
import AnnouncementBar from '@/features/home/components/AnnouncementBar';
import SettingsInitializer from '@/components/providers/SettingsInitializer';
import { Section } from '@/components/layout/Section';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import FaqSection from '@/features/home/components/FaqSection';
import { JsonLd } from '@/components/shared/JsonLd';

export const revalidate = 3600; // 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettingsData();
  return {
    title: `${settings.journal_name} | Elite Academic Publishing`,
    description: `Welcome to ${settings.journal_name} (${settings.journal_short_name}). We provide a global platform for breakthrough research in engineering, science, and technology with rapid, high-quality peer review.`,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: settings.journal_name,
      description: `Advancing scientific excellence through innovative trends. Explore peer-reviewed research and elite academic publishing at ${settings.journal_short_name}.`,
      type: 'website',
      siteName: settings.journal_name,
      images: [
        {
          url: '/open_graph_img.png',
          width: 1200,
          height: 630,
          alt: `${settings.journal_short_name} - Global Research Platform`,
        },
      ],
    }
  };
}

export default async function Home() {
  const settings = await getSettingsData();

  return (
    <main className="flex flex-col overflow-hidden bg-background relative">
      <SettingsInitializer settings={settings} />
      <AnnouncementBar />
      
      {/* Background Decorative Blob */}
      <div className="absolute top-[20%] right-0 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[150px] -z-10 group-hover:bg-primary/5 transition-colors duration-1000" />
      <div className="absolute bottom-[10%] left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 group-hover:bg-secondary/10 transition-colors duration-1000" />

      <HomeCarousel />

      {/* Institutional Core Section */}
      <Section className="relative z-10">
        <SidebarLayout
          className="my-20"
          sidebar={
            <>
              <div className="p-1 rounded-4xl bg-linear-to-br from-primary/10 to-transparent border border-primary/10 shadow-vip hover:shadow-vip-hover transition-shadow duration-500">
                <div className="bg-primary/5 backdrop-blur-sm p-2 rounded-[1.8rem]">
                  <TrackManuscriptWidget />
                </div>
              </div>

              <div className="space-y-8">
                <CurrentIssueWidget />
                <AnnouncementsWidget />
                <AuthorQuickLinks />
                <CallForPapersWidget />
                <ResourceDeskWidget settings={settings} />
                <EthicsWidget />
              </div>
            </>
          }
        >
          <WelcomeSection
            journalName={settings.journal_name}
            journalShortName={settings.journal_short_name}
            settings={settings}
          />
          <HomeStats />
          <AimAndScope journalShortName={settings.journal_short_name} />
        </SidebarLayout>
      </Section>

      <PublisherSection settings={settings} />
      <FaqSection />
      
      <JsonLd 
        id="home-faq"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How long does the peer-review process take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our standard peer-review process typically takes 4-6 weeks. We prioritize quality and thoroughness while ensuring a fast-track publication path for groundbreaking research."
              }
            },
            {
              "@type": "Question",
              "name": "Is IJITEST indexed in major databases?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "As a new scholarly startup, IJITEST is currently in the process of being indexed with major databases like Google Scholar and Crossref. We are committed to ensuring maximum visibility for all published research as we grow."
              }
            },
            {
              "@type": "Question",
              "name": "Does the journal have an ISSN number?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We have initiated the application process for the International Standard Serial Number (ISSN). Authors will be updated as soon as the formal registration is completed, which will apply retrospectively to all published volumes."
              }
            },
            {
              "@type": "Question",
              "name": "What are the submission guidelines for authors?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Authors should ensure their manuscripts follow our standard template, include an abstract, keywords, and properly formatted references. Detailed guidelines are available in our Author Resource Desk."
              }
            },
            {
              "@type": "Question",
              "name": "Do you provide Open Access publication?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, IJITEST is a Gold Open Access journal. All published articles are immediately available to the global research community without any subscription barriers."
              }
            },
            {
              "@type": "Question",
              "name": "How can I join the Editorial Board or become a Reviewer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We welcome experts from various engineering and science disciplines. You can apply through our 'Join Us' page by submitting your CV and area of expertise."
              }
            }
          ]
        }} 
      />
    </main>
  );
}
