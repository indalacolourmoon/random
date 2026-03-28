'use client';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface WelcomeSectionProps {
    journalName?: string;
    journalShortName?: string;
    settings: Record<string, string>;
}

function WelcomeSection({ journalName, journalShortName, settings }: WelcomeSectionProps) {
    const name = journalName || "International Journal of Innovative Trends in Engineering Science and Technology";
    const shortName = journalShortName || "IJITEST";

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group"
            aria-labelledby="welcome-heading"
        >
            <h1 id="welcome-heading" className="mb-8 sm:mb-12">
                Welcome to {shortName}
            </h1>
 
            <div className="text-primary/80 font-medium border-l-4 border-secondary/30 group-hover:border-secondary transition-colors duration-300 pl-6 sm:pl-10 space-y-6 text-left text-pretty max-w-none">
                <p>
                    {name} ({shortName}) is an elite international, peer-reviewed scholarly journal dedicated to the dissemination of high-quality research in Engineering, Science, Technology, and Management. The journal encourages fundamental, interdisciplinary, theoretical, and applied research that advances innovation, industrial development, and sustainable practices across emerging and established domains. {shortName} follows a rigorous double-blind peer-review process and adheres strictly to global ethical publishing standards.
                </p>
            </div>
        </motion.section>
    );
}

export default memo(WelcomeSection);
