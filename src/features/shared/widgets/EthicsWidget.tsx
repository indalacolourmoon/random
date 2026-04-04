"use client";

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'framer-motion';

function EthicsWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="bg-primary p-8 2xl:p-14 rounded-4xl text-white shadow-xl shadow-secondary/20 group">
                <h3 className="text-white mb-2">Ethics Statement</h3>
                <p className="text-white/70 mb-8 font-medium">IJITEST follows COPE (Committee on Publication Ethics) guidelines for research integrity.</p>
                <Link href="/ethics" className="border-b-2 border-white/20 hover:border-white transition-all pb-1 inline-flex items-center gap-2 m-0">
                    View Ethics <ChevronRight className="w-4 h-4 2xl:w-6 2xl:h-6" />
                </Link>
            </div>
        </motion.div>
    );
}

export default memo(EthicsWidget);
