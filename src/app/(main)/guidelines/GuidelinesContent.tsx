"use client";

import { motion } from 'framer-motion';
import {
    FileText,
    Layout,
    Type,
    List,
    Image as ImageIcon,
    BookOpen,
    Download,
    Mail,
    CreditCard,
    Hash,
    Info,
    CheckCircle2,
    Users,
    ClipboardCheck,
    Send,
    Edit3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';

interface GuidelinesContentProps {
    settings: Record<string, string>;
}

export default function GuidelinesContent({ settings }: GuidelinesContentProps) {
    const journalName = settings.journal_name || "International Journal of Science and Applied Information Technology (IJSAIT)";
    const supportEmail = settings.support_email || "editor@iitest.org";

    const sections = [
        {
            title: "Introduction",
            content: (
                <p>
                    Authors are requested to read and follow the instructions below carefully before submitting their papers; so that it will be helpful for the publication of your paper is as rapid and efficient as possible. The Publisher of the journal reserves the right to return manuscripts that are not prepared in according to the guidelines of the journal.
                </p>
            )
        },
        {
            title: "Paper Review",
            content: (
                <ul className="space-y-4 list-none pl-0">
                    {[
                        "All submitted papers are subject to peer review and are expected to meet standards of academic excellence.",
                        "The reviewers recommendations determine the process of whether the submitted paper should be accepted/accepted subject to changes/subject to resubmission with significant changes/rejected.",
                        "The papers which needs change, will be requested for change and the modified paper will be reviewed by the same reviewers.",
                        "The Review report of the reviewed articles will be kept in confidential.",
                        "It will take 2-3 weeks to review a paper."
                    ].map((item, i) => (
                        <li key={i} className="flex gap-4">
                            <div className="mt-2 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        {
            title: "Indexing in Database",
            content: (
                <div className="space-y-4">
                    <p>
                        The entire process of inclusion of any article (s) in the indexing and abstracting for bibliographic database (Scopus, WOS, etc..) is done by bibliographic database team only ( Scopus, WOS, etc.,).
                    </p>
                    <p>
                        Neither Journal nor the publisher &lsquo;The World Academy of Research in Science and Engineering&rdquo; does not have any involvement in the decision whether to accept or reject an article from indexing and abstracting services for any bibliographic database ( Scopus, WOS, etc..) and also force the processing time of the article for indexing and abstracting in the bibliographic database.
                    </p>
                </div>
            )
        },
        {
            title: "Publication Fee",
            content: (
                <div className="space-y-4">
                    <p>
                        Publication fee for Indian Authors is <span className="text-secondary">Rs. {settings.apc_inr}</span> and <span className="text-secondary">USD {settings.apc_usd}</span> for Foreign Authors for maximum of 5 authors upto 8 pages.
                    </p>
                </div>
            )
        },
        {
            title: "Paper Formatting Guidelines",
            content: (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-secondary font-black mb-4">1. Text and Type Area (Margins)</h3>
                        <p>Paper should of standard format (8.5 &ldquo; x 11&rdquo;) with the text fully justified.</p>
                        <p className="mt-2 ">Margins : Top 0.7&rdquo;, Bottom 0.7&rdquo;, Right 0.6&rdquo;, Left 0.6&rdquo;</p>
                        <p className="mt-2">Paper should be in two column format with column width 3.42&rdquo; and space between columns be 0.2&rdquo;. No figures should fall out of this text page.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary font-black mb-4">2. Titles Format</h3>
                        <ul className="space-y-2 list-none pl-0">
                            <li>• <b>Paper Title :</b> Capitalize Each Word case, 14 point type (Times Roman Bold)</li>
                            <li>• <b>Author(s) and Affiliation :</b> Capitalize Each Word case, 10 point type (Times Roman)</li>
                            <li>• <b>Head :</b> BOLD CAPITAL LETTERS. 10 point type (Times Roman)</li>
                            <li>• <b>Sub Head :</b> Lower case, 10 point (Times Roman)</li>
                        </ul>
                        <p className="mt-4 text-sm text-primary/60 ">Note: Leave two line spaces between title and author names/affiliation. Leave 3 lines spaces between author/affiliation and abstract.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary font-black mb-4">3. Text</h3>
                        <p>Text type should be 10 point Times Roman. Text should be single spaced. First line of all paragraphs should be indented and there should be one line gap between consecutive paragraphs.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary font-black mb-4">4. Heads / Sub Heads</h3>
                        <p>Levels of subheads should be easily distinguishable from each other with the use of numbers. There should be one line spaces before each subhead and one line space after each subhead.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary font-black mb-4">5. Figures and Tables</h3>
                        <p>Legends/Captions should be 9 point (Times Roman). Figure legend should be beneath the figure (Figure 1, Figure 2 etc..) and table legend should be above the table (Table 1, Table 2 etc….). Both must be cited in text.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary font-black mb-4">6. References</h3>
                        <p className="mb-4">References text type should be 10 point (Times Roman) at the end of the paper. Format as follows:</p>
                        <div className="space-y-4 bg-primary/5 p-6 rounded-2xl border border-primary/10 font-mono text-xs overflow-x-auto">
                            <p>[1] Jesmin Nahar and Tasadduq Imam et al,&rdquo; Association rule mining to detect factors which contribute to heart disease in males and females&rdquo;, Journal of Expert Systems with Applications Vol.40, PP.1086&ndash;1093, 2013</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Authors Limitation",
            content: (
                <p>Maximum number of five authors is allowed for each paper.</p>
            )
        },
        {
            title: "Proofs",
            content: (
                <p>Modified Papers must be returned to the publisher within 4-5 days of receipt. The publisher will do everything possible to ensure prompt publication.</p>
            )
        },
        {
            title: "Editorial Board & Reviewers",
            content: (
                <div className="space-y-4">
                    <p>We welcome Professors, Engineering Experts and Scientists to join in our Editorial Board Members or as Reviewers. Interested persons can send us an email, along with their curriculum vitae (CV), to <a href={`mailto:${supportEmail}`} className="text-secondary font-bold hover:underline">{supportEmail}</a>.</p>
                </div>
            )
        },
        {
            title: "Paper Submission Instructions",
            content: (
                <div className="space-y-6">
                    <p>
                        Authors are requested to submit their papers formatted according to the guidelines provided electronically through <Link href="/submit" className="text-secondary font-bold hover:underline cursor-pointer">Submit Your Manuscript</Link> or to <a href={`mailto:${supportEmail}`} className="text-secondary font-bold hover:underline cursor-pointer">{supportEmail}</a>.
                    </p>
                    <p>
                        All submitted articles should report original, previously unpublished research results. The final paper (.doc/.docx) along with the signed COPYRIGHT FORM should be submitted. All authors should sign individually.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button asChild size="lg" className="btn-primary">
                            <Link href="/submit">Submit Manuscript</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="btn-outline">
                            <a href={settings.template_url || "/docs/template.docx"} download>
                                <Download className="w-5 h-5 2xl:w-8 2xl:h-8 mr-2" /> Download Template
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="btn-outline">
                            <a href={settings.copyright_url || "/docs/copyright-form.docx"} download>
                                <Download className="w-5 h-5 2xl:w-8 2xl:h-8 mr-2" /> Copyright Form
                            </a>
                        </Button>
                    </div>
                </div>
            )
        }
    ];

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Author Guidelines"
                description={`Comprehensive protocol for submitting manuscripts to ${settings.journal_short_name || 'IJITEST'}.`}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Guidelines', href: '/guidelines' },
                ]}
            />

            <section className="container-responsive section-padding">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 sm:gap-16 2xl:gap-24">
                    {/* Navigation Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1 sticky top-32 h-fit space-y-4">
                        <h3 className="text-primary mb-6 m-0 font-black tracking-widest uppercase">Quick Navigation</h3>
                        <nav className="space-y-4 border-l border-primary/10 pl-4">
                            {sections.map((section, idx) => (
                                <a
                                    key={idx}
                                    href={`#guideline-${idx}`}
                                    className="text-primary/60 hover:text-secondary block py-1 m-0 text-sm 2xl:text-lgJournal Portals font-medium transition-colors"
                                >
                                    {section.title}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-12">
                        {sections.map((section, idx) => (
                            <section key={idx} id={`guideline-${idx}`} className="scroll-mt-32">
                                <h2 className="text-secondary tracking-wider mb-3 flex items-baseline gap-4 font-black">
                                    {section.title}
                                </h2>
                                <div className="text-justify text-primary/80 space-y-3 2xl:space-y-6 font-medium leading-relaxed border-l-[3px] border-secondary/20 pl-8 2xl:pl-12 text-sm 2xl:text-xl">
                                    {section.content}
                                </div>
                            </section>
                        ))}

                        {/* Support Card */}
                        <section className="bg-primary p-10 sm:p-14 2xl:p-24 rounded-[2.5rem] 2xl:rounded-[5rem] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="relative z-10 space-y-6 text-center">
                                <h2 className="font-black text-white m-0">Need Assistance?</h2>
                                <p className="text-white/60 max-w-xl mx-auto font-medium m-0">For any queries regarding paper submission or formatting, contact our editorial team.</p>
                                <a
                                    href={`mailto:${supportEmail}`}
                                    className="text-secondary hover:text-white transition-colors border-b-2 border-secondary/30 hover:border-white pb-2 inline-block font-bold text-xl lg:text-3xl"
                                >
                                    {supportEmail}
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </section>
        </main>
    );
}

