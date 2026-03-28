'use client';

import { ShieldCheck, Mail, Globe, BookMarked, RefreshCw, Scale, Users, FileText, Lock, Archive, AlertTriangle, UserCheck, Gavel, FileSignature, HelpCircle, Cpu } from 'lucide-react';
import Link from 'next/link';

interface EthicsClientProps {
    settings: Record<string, string>;
}

export default function EthicsClient({ settings }: EthicsClientProps) {
    const journalName = settings.journal_name || "International Journal of Science and Applied Information Technology (IJITEST)";
    const supportEmail = settings.support_email || "editor@iitest.org";

    const sections = [
        {
            title: "Publication Ethics & Malpractice Statement",
            content: (
                <div className="space-y-4">
                    <p>
                        {journalName} is committed to ensuring ethics in publication and quality of articles. In order to maintain the standards of publication ethics IJITEST takes all possible measures and steps against any publication misconducts. Authors while submitting their manuscript to the IJITEST journal for publication should ensure that their work is entirely original work, and if the work and/or words of others (whole or part) have been used, this has been appropriately acknowledged. In no case the journal or the editors encourage any type of misconduct, or knowingly allow any type of misconduct to take place.
                    </p>
                </div>
            )
        },
        {
            title: "Peer-review Policy",
            content: (
                <div className="space-y-4">
                    <p>
                        IJITEST panel is committed to objective and unbiased peer review process conducted in collaboration with editorial board members and independent referees, to prevent any type of conflict of interests between the editorial and review personnel and the reviewed paper. If there are any discrepancy from the above, it should be reported to <a href={`mailto:${supportEmail}`} className="text-secondary font-bold hover:underline">{supportEmail}</a> in order to take required actions immediately.
                    </p>
                    <p>
                        When a scholarly work is submitted to the journal, it first undergoes a preliminary review. The Editor-in-chief decides if the manuscript should be sent for peer review or be immediately rejected. Next step is to select experts from the same field who are qualified and able to review the work impartially and the papers will be sent to them. If a submitted paper is rejected, this does not necessarily mean it is of poor quality. A paper may also be rejected because it doesn't fall within the journal's area of specialisation or because it doesn't meet the high standards of novelty and originality required by the journal in question.
                    </p>
                </div>
            )
        },
        {
            title: "Open Access Policy",
            content: (
                <div className="space-y-4">
                    <p>
                        In order to ensure maximum reach of the papers published by {journalName}, Open Access Policy is adopted; meaning that:
                    </p>
                    <ul className="space-y-2 list-none pl-0">
                        <li className="flex items-start gap-4">
                            <div className="mt-2 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                            <span>All the papers published by {journalName} are made freely accessible online immediately after they are published in an easily readable format, without any subscription or any type of registration.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "Archiving Policy",
            content: (
                <p>
                    All the papers published in IJITEST utilizes Amazon Web Services System to store the published articles as permanent archives for purposes of preservation and restoration.
                </p>
            )
        },
        {
            title: "Publication Ethics",
            content: (
                <div className="space-y-4">
                    <p>
                        The works submitted by the authors for publication must be original, previously unpublished, and not under consideration for publication elsewhere. If the author uses any previously published figures, tables, or parts of text are to be included, the copyright-holder&apos;s permission must have been obtained prior to submission of the paper.
                    </p>
                    <p>
                        Plagiarism in all its forms constitutes unethical publishing behavior and is unacceptable in any manner. Also submitting the same manuscript to more than one journal concurrently constitutes unethical publishing behavior and is unacceptable. So the author(s) are requested not to submit their manuscripts to more than one journal at the same time.
                    </p>
                    <p>
                        Papers not in accordance with publications ethics and found malpractices will be removed immediately from publication if detected at any point of time.
                    </p>
                    <p>
                        IJITEST publishers reserves the right to use any plagiarism detecting tool to screen the submitted papers at any time and if any suspected plagiarism or duplicate publishing will be reported immediately.
                    </p>
                </div>
            )
        },
        {
            title: "Role of Authors",
            content: (
                <ul className="space-y-3 list-none pl-0">
                    {[
                        "Work submitted by the authors should present an objective discussion of the significance of research work",
                        "Works submitted by the authors should be entirely original and no work or words of others works have been used in their papers. The authors should ensure the same.",
                        "Authors are obliged to participate in peer review process.",
                        "Authors should not copy and paste from any other works without proper citation",
                        "Authors should not mention their name on another person’s article",
                        "Authors should not copy exact wording from other's individual work",
                        "Authors should not use tables, diagrams, photos or ideas from other works without proper references / citations",
                        "Authors should not publish the same paper in more than one journal",
                        "Authors should acknowledge any type of financial support of others if appropriate",
                        "Financial support and conflict of interest for the project/research work if any should be dsclosed."
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4">
                            <div className="mt-2 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        {
            title: "Role of Editors",
            content: (
                <ul className="space-y-3 list-none pl-0">
                    {[
                        "Editors have complete responsibility and authority to accept/reject a manuscript submitted.",
                        "Editors have the responsibility to evaluate manuscripts exclusively on the basis of their academic merit.",
                        "Editors are one who act in a balanced, objective and fair way while carrying out their expected duties",
                        "Editors has the rights to accept the paper when reasonably certain.",
                        "Editors are not supposed to add or delete information in the paper without the express written consent of the author.",
                        "Editor reserves the right to refuse any manuscript , whether on invitation or otherwise, and to make suggestions and/or modifications before publication.",
                        "Editors will strive to prevent any conflict of interest between the author and editorial/review personnel.",
                        "Editors will keep all the information related to the submitted article in confidential prior to publishing"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4">
                            <div className="mt-2 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        {
            title: "Role of Reviewers",
            content: (
                <ul className="space-y-3 list-none pl-0">
                    {[
                        "Reviewers has the responsibility to have a good rapid with Assistance to Editors.",
                        "Reviewers should maintain confidentiality, point out relevant published work which is not cited in the paper, point out whether any content from other published works are used",
                        "Reviewers are responsible to send the review reports in prompt to the editors and Disclosure and conflict of interest."
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4">
                            <div className="mt-2 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        {
            title: "Role of Publisher",
            content: (
                <ul className="space-y-3 list-none pl-0">
                    {[
                        "Publisher will thoroughly monitor publishing ethics",
                        "Publisher will have the responsibility to directly communicate with the editor",
                        "Publisher protects Intellectual property and copyright",
                        "Publisher will frequently work for the improvement of the quality of the journal"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4">
                            <div className="mt-2 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        {
            title: "Article withdraw policy",
            content: (
                <p>
                    Editor is solely and independently responsible for deciding which articles submitted to the journal shall be published. Editor will thoroughly follow the policies of the journal’s editorial board and constrained by such legal requirements in force regarding libel, copyright infringement and plagiarism. Articles that have been published shall remain online without any modifications as far as is possible. However, on some unavoidable occasions if the published article is to be retracted or even to be removed shall be done only under the following exceptional circumstances:
                    <br /><br />
                    • Article will be retracted in situations like Infringements of professional ethical codes.<br />
                    • Article will be removed in situations like Legal limitations upon the publisher, copyright holder or author(s).<br />
                    • Article will be replaced in situations like Identification of false or inaccurate data
                </p>
            )
        },
        {
            title: "Correction and Retraction Policy",
            content: (
                <div className="space-y-4">
                    <p>To minimise requests for post-publication edits:</p>
                    <ul className="space-y-3 list-none pl-0 mb-6">
                        {[
                            "Editors will ensure that the author(s) has been given an opportunity to sign off their final draft prior to the files being sent to typesetting. It should be made clear that future edits will not be possible",
                            "Editors shall give the final draft a thorough read through prior to sending it to typesetting to make sure that they are happy with the content",
                            "All articles will have their PDF proofs checked by the author or editor prior to publication. This is a final chance to catch layout errors and minor editorial issues such as typos. This is not an opportunity for wider content editing"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="mt-2 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="font-bold">i) Amendment</p>
                    <p>For very minor content or metadata issues, IJITEST may directly amend the article (PDF) if the error is reported very soon after publication (normally 2 days) and the publication has not yet been sent out for indexing.</p>

                    <p className="font-bold">ii) Correction Article</p>
                    <p>Once this indexing process has begun (usually within a day or so of publication), all corrections must be released as a separate publication, linked to the original. This ensures that the integrity and transparency of the academic record is maintained.</p>

                    <p className="font-bold">iii) Retraction</p>
                    <p>Retractions are used to remove a published paper from the scientific record. Retractions are used when editors have clear evidence that the article’s findings are unreliable, either as a result of misconduct or honest error.</p>
                </div>
            )
        },
        {
            title: "Authorship",
            content: (
                <p>
                    Authorship of research publications should compulsorily reflect individual’s contributions to the entire content of the work. Authors should take the collective responsibility for the submitted and published work. Naming authors in the paper ensures that all the authors get credit, and are accountable for the research being reported. While it is possible to name two first authors, one author must be designated as the corresponding author when submitting a manuscript.
                </p>
            )
        },
        {
            title: "Special Issues",
            content: (
                <div className="space-y-4">
                    <p>While submitting the proposals for Special Issues, Guest Editors of the special issue must make it sure that the proposal adheres to aims and scopes of the journal.</p>
                    <p>We are an open access journal and charges applicable for publishing in Special Issue is to compensate the expenses for processing and production of the manuscript.</p>
                </div>
            )
        },
        {
            title: "Disclaimer",
            content: (
                <p>
                    The author(s) of each article appearing in IJITEST Journal is/are solely responsible for the content thereof; neither the Publisher nor the journal editors or anyone else involved in creating, producing or distribution assumes any liability or responsibility for the accuracy, completeness, or usefulness of any information provided.
                </p>
            )
        },
        {
            title: "Plagiarism",
            content: (
                <div className="space-y-4">
                    <p>As part of our commitment to the protection and enhancement of the peer review process, IJITEST journal would like to ensure that all published articles are within the accepted level of plagiarism. The publisher uses plagiarism detection tool to check the plagiarism of the paper submitted. In case, plagiarism is detected during review/editorial process, such manuscript(s) will be rejected immediately.</p>
                    <p>Please report the plagiarism to <a href={`mailto:${supportEmail}`} className="text-secondary font-bold hover:underline">{supportEmail}</a></p>
                </div>
            )
        },
        {
            title: "Informed Consent Policy",
            content: (
                <p>
                    Individual participants in studies have their rights to decide what happens to the personal data gathered. This is especially true concerning images of vulnerable people or the use of images in sensitive contexts. authors are needed to secure written consent before including images, hide the identities, or any type of details as per International Publication Ethics and Best Practices.
                </p>
            )
        },
        {
            title: "GenAI Policy",
            content: (
                <div className="space-y-6">
                    <p className="font-bold  text-primary/60">IJITEST Policy on the Use of Generative Artificial Intelligence (GenAI) in Research and Manuscript Preparation</p>
                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                        <h4 className="font-bold text-primary mb-3">Permitted Uses:</h4>
                        <ul className="space-y-2 list-none pl-0">
                            {[
                                "Generating research ideas and assisting with research design.",
                                "Language editing and grammar correction",
                                "Enhancing clarity and coherence of text",
                                "Generating visual aids, such as figures or graphs, provided proper attribution is given."
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3">
                                    <div className="mt-2 w-1 h-1 bg-secondary rounded-full shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
                        <h4 className="font-bold text-red-900 mb-3">Prohibited Uses:</h4>
                        <p className="text-red-800 text-sm mb-4">GenAI tools must not be used for:</p>
                        <ul className="space-y-2 list-none pl-0 text-red-800">
                            {[
                                "Data generation, data collection, data analysis, or interpretation.",
                                "Drafting or writing any part of the manuscript.",
                                "Generate content that lacks originality, academic rigor, or scholarly integrity.",
                                "GenAI tools cannot be credited with authorship because they cannot be held accountable for research integrity."
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3">
                                    <div className="mt-2 w-1 h-1 bg-red-400 rounded-full shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p>
                        Authors must explicitly disclose all GenAI use in their research and manuscript preparation. This disclosure should appear in the <span className="font-bold">Acknowledgements section</span>.
                    </p>
                </div>
            )
        }
    ];

    return (
        <section className="container-responsive section-padding">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 sm:gap-16">
                {/* Fixed Navigation Sidebar for Professional feel */}
                <aside className="hidden lg:block lg:col-span-1 sticky top-32 h-fit space-y-4">
                    <h3 className="text-primary mb-6 m-0 font-black tracking-widest uppercase">Quick Navigation</h3>
                    <nav className="space-y-4 border-l border-primary/10 pl-4">
                        {sections.map((section, idx) => (
                            <a
                                key={idx}
                                href={`#section-${idx}`}
                                className="text-primary/60 hover:text-secondary block py-1 m-0 text-sm font-medium transition-colors"
                            >
                                {section.title}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-10">
                    {sections.map((section, idx) => (
                        <section key={idx} id={`section-${idx}`} className="scroll-mt-32">
                            <h2 className="text-primary mb-2 m-0 font-black uppercase tracking-wider">
                                {section.title}
                            </h2>
                            <div className="text-justify text-primary/80 space-y-6 font-medium border-l-[3px] border-secondary/20 pl-8 2xl:pl-12">
                                {section.content}
                            </div>
                        </section>
                    ))}

                    {/* Report Section */}
                    <section className="bg-primary p-10 sm:p-14 2xl:p-24 rounded-[2.5rem] 2xl:rounded-[5rem] text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative z-10 space-y-6 text-center">
                            <h2 className="text-white font-black m-0">Ethics Committee</h2>
                            <p className="text-white/60 max-w-xl mx-auto font-medium">Report any ethics concerns or plagiarism sightings directly to our board for immediate evaluation and action.</p>
                            <a
                                href={`mailto:${supportEmail}`}
                                className="text-secondary hover:text-white transition-colors border-b-2 border-secondary/30 hover:border-white pb-2 inline-block font-black text-xl lg:text-3xl"
                            >
                                {supportEmail}
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}

