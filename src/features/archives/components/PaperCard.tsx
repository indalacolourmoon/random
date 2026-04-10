import { memo } from 'react';
import { Download, User, BookOpen, Eye, Globe } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
        <Card className="border-primary/5 shadow-3xl hover:shadow-vip transition-all duration-700 group overflow-hidden  relative rounded-lg border-t-2 border-t-transparent hover:border-t-secondary/40">
            <div className="absolute inset-0 bg-primary/[0.01] -z-10 group-hover:bg-primary/[0.03] transition-colors" />
            <CardContent className="p-2">
                <div className="flex flex-col gap-5">
                    

                    <div className="space-y-6">
                        <Link href={`${basePath}/${paper.id}`}>
                            <h3 className="font-serif font-bold  tracking-wide text-[#000066]  cursor-pointer m-0 leading-[1.1] text-xl xl:text-2xl 2xl:text-4xl ">
                                {paper.title}
                            </h3>
                        </Link>

                        <div className="flex flex-wrap items-center gap-10 2xl:gap-20 pt-4">
                            <div className="flex items-center gap-2">
                                   <span className='border-b border-red-600'> Authors</span> <span className='text-red-500 font-bold text-xl'>:</span>
                                
                                <div className="space-y-1">
                                    <p className="text-primary text-base 2xl:text-4xl m-0 tracking-wide">{paper.author_name}</p>
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Actions - High Contrast */}
                    <div className="flex flex-col sm:flex-row items-center gap-6  ">
                        <Button asChild className=" bg-primary shadow-2xl shadow-primary/20 rounded-md hover:scale-[1.03] transition-all w-full sm:w-auto ">
                            <Link href={`${basePath}/${paper.id}`} className="flex items-center gap-4 py-2">
                                <Eye className="size-5 xl:size:6 2xl:size-8 text-xl text-white" /> View Article
                            </Link>
                        </Button>

                        
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

export default PaperCard;
