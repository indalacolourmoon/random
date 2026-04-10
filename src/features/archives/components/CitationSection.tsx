import { Quote, Share2 } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

interface CitationSectionProps {
    paper: {
        title: string;
        author_name: string;
        publication_year: number;
        volume_number?: number;
        issue_number?: number;
        paper_id: string;
        co_authors?: string;
    };
}

export default function CitationSection({ paper }: CitationSectionProps) {
    const settings = useSettingsStore((state) => state.settings);

    // 1. Parse Authors for the citation
    const getFormattedAuthors = () => {
        let authStr = paper.author_name;
        try {
            if (paper.co_authors) {
                const coAuthors = JSON.parse(paper.co_authors);
                if (Array.isArray(coAuthors) && coAuthors.length > 0) {
                    const names = coAuthors.map((a: any) => a.name);
                    if (names.length === 1) {
                        authStr = `${paper.author_name} & ${names[0]}`;
                    } else {
                        const allButLast = names.slice(0, -1);
                        const last = names[names.length - 1];
                        authStr = `${paper.author_name}, ${allButLast.join(', ')} & ${last}`;
                    }
                }
            }
        } catch (e) {
            console.error("Citation parsing error", e);
        }
        return authStr;
    };

    const authors = getFormattedAuthors();
    const citationText = `${authors} (${paper.publication_year || new Date().getFullYear()}). "${paper.title}". International Journal of Innovative Trends in Engineering Science and Technology (IJITEST), Vol. ${paper.volume_number || 'X'}, Issue ${paper.issue_number || 'X'}. Paper ID: ${paper.paper_id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(citationText);
        alert("Citation copied to clipboard!");
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 space-y-6 sticky top-24">
            <div className="flex items-center gap-3 text-primary">
                <Quote className="w-6 h-6 rotate-180" />
                <h3 className="font-serif font-black ">Cite this Article</h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 relative group">
                <p className="text-xs text-gray-600 leading-relaxed font-medium ">
                    {authors}   <span className="italic"> "  {paper.title}"</span>.
                    <br />
                    <span className="">International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)</span>,
                    Vol. {paper.volume_number || 'X'}, Issue {paper.issue_number || 'X'} , {paper.publication_year || new Date().getFullYear()}.
                    <br />
                </p>
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-400 py-3 rounded-xl text-[10px] font-black  tracking-widest border border-gray-100 hover:text-primary hover:border-primary/20 transition-all font-sans"
                >
                    Copy Citation
                </button>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: paper.title,
                                text: `Check out this research paper: ${paper.title}`,
                                url: window.location.href
                            });
                        } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                        }
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-gray-50 text-gray-500 py-4 rounded-2xl font-black text-[10px]  tracking-[0.2em] border border-gray-100 hover:bg-gray-100 transition-all font-sans"
                >
                    <Share2 className="w-4 h-4" /> Share Research
                </button>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 tracking-widest text-center uppercase">Journal Metadata</h4>
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-center group/meta">
                        <p className="text-[8px] font-black text-gray-400 tracking-[0.2em] uppercase mb-1 group-hover/meta:text-primary transition-colors">ISSN (Online)</p>
                        <p className="text-sm font-black text-gray-900 ">{settings.issn_number || '2584-2579'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
