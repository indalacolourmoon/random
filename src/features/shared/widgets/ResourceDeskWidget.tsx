import { Download } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

interface ResourceDeskWidgetProps {
    settings?: Record<string, string>;
}

function ResourceDeskWidget({ settings }: ResourceDeskWidgetProps) {
    const resources = [
        { label: "Word Template", type: "DOCX", link: settings?.template_url || "/docs/template.docx" },
        { label: "Copyright Form", type: "DOCX", link: settings?.copyright_url || "/docs/copyright-form.docx" }
    ];

    return (
        <div className="bg-gray-50 p-8 2xl:p-14 rounded-xl 2xl:rounded-[3rem] border border-gray-200">
            <h3 className="mb-6 m-0">Resource Desk</h3>
            <div className="grid gap-3 2xl:gap-6">
                {resources.map((doc, i) => (
                    <Link key={i} href={doc.link} className="flex items-center justify-between p-5 2xl:p-10 bg-white rounded-2xl 2xl:rounded-[2rem] border border-gray-400 hover:border-primary group transition-all">
                        <div>
                            <p className="text-primary mb-0.5 m-0 m-0">{doc.type}</p>
                            <p className="font-bold text-gray-900 group-hover:text-primary transition-colors m-0">{doc.label}</p>
                        </div>
                        <Download className="w-4 h-4 2xl:w-8 2xl:h-8 text-gray-900 group-hover:text-primary transition-colors animate-bounce " />
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default memo(ResourceDeskWidget);
