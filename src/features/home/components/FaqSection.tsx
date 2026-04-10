'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    question: "How long does the peer-review process take?",
    answer: "Our standard peer-review process typically takes 4-6 weeks. We prioritize quality and thoroughness while ensuring a fast-track publication path for groundbreaking research."
  },
  {
    question: "Is IJITEST indexed in major databases?",
    answer: "As a new scholarly startup, IJITEST is currently in the process of being indexed with major databases like Google Scholar and Crossref. We are committed to ensuring maximum visibility for all published research as we grow."
  },
  {
    question: "Does the journal have an ISSN number?",
    answer: "We have initiated the application process for the International Standard Serial Number (ISSN). Authors will be updated as soon as the formal registration is completed, which will apply retrospectively to all published volumes."
  },
  {
    question: "What are the submission guidelines for authors?",
    answer: "Authors should ensure their manuscripts follow our standard template, include an abstract, keywords, and properly formatted references. Detailed guidelines are available in our Author Resource Desk."
  },
  {
    question: "Do you provide Open Access publication?",
    answer: "Yes, IJITEST is a Gold Open Access journal. All published articles are immediately available to the global research community without any subscription barriers."
  }
];

export default function FaqSection() {
  return (
    <section className="py-16 md:py-24 bg-card/30" id="faqs">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <Badge variant="outline" className="bg-[#000066]/5 text-[#000066] border-[#000066]/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Common Questions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[#000066] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Everything you need to know about the publication process, indexing, and joining our scientific community.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQS.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border/50 rounded-xl bg-card px-4 md:px-6 transition-all hover:border-[#000066]/20 shadow-sm"
              >
                <AccordionTrigger className="text-left py-5 text-sm md:text-base font-semibold text-foreground hover:no-underline hover:text-[#000066] transition-colors">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#000066]/60 shrink-0" />
                    {faq.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5 pt-0">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="pt-8 text-center border-t border-border/50">
            <p className="text-xs text-muted-foreground italic">
              Can't find what you're looking for? <a href="/contact" className="text-[#000066] font-semibold underline-offset-4 hover:underline">Contact our support team</a> directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
