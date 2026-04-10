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
                <div className="lg:col-span-12 xl:col-span-12 2xl:col-span-5 space-y-10">
                    <header className="space-y-3">
                        <h2 id="join-us-heading" className="text-xl font-semibold text-[#000066]">
                            Join as Reviewer
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-lg">
                            Become a reviewer and help advance scientific research.
                        </p>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-1 gap-4" role="list" aria-label="Benefits of joining">
                        {BENEFITS.map((benefit, i) => (
                            <article key={i} role="listitem" className="p-5 bg-card border border-border/50 rounded-xl transition-all group hover:bg-muted/20">
                                <div className="flex gap-5 items-center">
                                    <div className="w-10 h-10 bg-[#000066]/5 rounded-lg flex items-center justify-center shrink-0 text-[#000066]" aria-hidden="true">
                                        <benefit.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-semibold text-foreground">{benefit.title}</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{benefit.desc}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                    <section className="p-6 rounded-lg bg-muted/20 border border-border/50" aria-labelledby="eligibility-heading">
                        <div className="space-y-5">
                             <h3 id="eligibility-heading" className="text-sm font-semibold text-[#000066]">Eligibility</h3>
                            <ul className="space-y-3">
                                {REQUIREMENTS.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-xs text-muted-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                     <aside className="p-4 bg-background border border-border/50 rounded-lg flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-[#000066] shrink-0" />
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {journalShortName} maintains rigorous ethical standards. Applications are subject to peer audit.
                        </p>
                    </aside>
                </div>

                {/* Right Column: Application Form */}
                <div className="lg:col-span-12 xl:col-span-12 2xl:col-span-7">
                    <div className="bg-card p-6 sm:p-10 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                        <ReviewerApplicationForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
