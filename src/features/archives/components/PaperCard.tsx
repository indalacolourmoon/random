import { memo } from 'react';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaperCardProps {
    paper: {
        id: number | string;
        paper_id: string;
        title: string;
        author_name: string;
        author_email?: string;
        affiliation?: string;
        keywords?: string;
        abstract?: string;
        file_path?: string;
        volume_number?: number;
        issue_number?: number;
        publication_year?: number;
        month_range?: string;
    };
    basePath?: string;
}

const PaperCard = memo(function PaperCard({ paper, basePath = '/archives' }: PaperCardProps) {
    return (
        <Card className="font-serif border-primary/10 shadow-sm hover:shadow-md transition-shadow group relative rounded-lg border-t-2 border-t-transparent hover:border-t-secondary/40">
            <CardContent className="p-4 xl:p-6 2xl:p-8">
                <div className="flex flex-col gap-6">
                    <div className="space-y-4">
                        <Link href={`${basePath}/${paper.id}`}>
                            <h3 className="font-serif font-semibold tracking-wide text-[#000066] cursor-pointer m-0 leading-tight text-xl xl:text-2xl 2xl:text-3xl">
                                {paper.title}
                            </h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <span className="border-b text-base xl:text-lg 2xl:text-xl border-red-600">Authors</span>
                                <span className="text-red-500 font-bold">:</span>
                                <div className="space-y-1">
                                    <p className="text-primary text-base xl:text-lg 2xl:text-xl m-0 tracking-wide">{paper.author_name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button asChild variant="default" className="bg-primary shadow-sm rounded-md transition-all w-full sm:w-auto h-10 xl:h-12">
                            <Link href={`${basePath}/${paper.id}`} className="flex items-center gap-2 px-6">
                                <Eye className="size-5 xl:size-6 text-white" />
                                <span className="text-base xl:text-lg">View Article</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

export default PaperCard;
