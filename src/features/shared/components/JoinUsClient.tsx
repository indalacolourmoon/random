import ReviewerApplicationForm from "@/features/reviewer/components/ReviewerApplicationForm";
import { CheckCircle2, Globe, Users, Award, ShieldCheck } from 'lucide-react';

const BENEFITS = [
    {
        icon: Globe,
        title: "Credit",
        desc: "Get credit for your quality review work."
    },
    {
        icon: Users,
        title: "Connect",
        desc: "Connect with editors and researchers."
    },
    {
        icon: Award,
        title: "Award",
        desc: "Receive official certificates for your review work."
    }
];

const REQUIREMENTS = [
    "PhD in Engineering or a related technical field",
    "Active research background with recent publications",
    "Minimum 5 peer-reviewed papers published",
    "Affiliation with a recognized academic or research institution"
];

interface JoinUsClientProps {
    settings: Record<string, string>;
}

export default function JoinUsClient({ settings }: JoinUsClientProps) {
    const journalShortName = settings.journal_short_name || "IJITEST";

    return (
        <section className="container-responsive py-12 sm:py-24" aria-labelledby="join-us-heading">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left Column: Benefits & Requirements */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-12">
                    <header className="space-y-4">
                        <h2 id="join-us-heading" className="text-primary opacity-60">
                            Reviewer role
                        </h2>
                        <p className="text-foreground leading-relaxed border-l-4 border-primary/20 pl-6">
                            Join our team to help maintain quality.
                        </p>
                    </header>
                    <div className="grid grid-cols-1 gap-4" role="list" aria-label="Benefits of joining">
                        {BENEFITS.map((benefit, i) => (
                            <article key={i} role="listitem" className="p-6 bg-card border border-primary/5 rounded-xl shadow-sm hover:bg-primary/2 transition-all group">
                                <div className="flex gap-6 items-center">
                                    <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner" aria-hidden="true">
                                        <benefit.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-primary">{benefit.title}</h3>
                                        <p className="opacity-60 leading-relaxed">{benefit.desc}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                    <section className="p-8 rounded-xl bg-primary/5 border border-primary/10 shadow-sm" aria-labelledby="eligibility-heading">
                        <div className="relative z-10 space-y-6">
                             <h3 id="eligibility-heading" className="text-primary opacity-60">Requirements</h3>
                            <ul className="space-y-3">
                                {REQUIREMENTS.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <span className="opacity-80">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                     <aside className="p-4 bg-background border border-primary/10 rounded-xl flex items-center gap-4">
                        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                        <p className="opacity-60 leading-relaxed">
                            {journalShortName} follows ethical guidelines. Applications are reviewed for alignment.
                        </p>
                    </aside>
                </div>

                {/* Right Column: Application Form */}
                <div className="lg:col-span-12 xl:col-span-7">
                    <div className="p-1 sm:p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="bg-background p-6 sm:p-8 rounded-lg shadow-sm">
                            <ReviewerApplicationForm />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
