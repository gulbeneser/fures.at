import { useLanguage } from "../contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { HelpCircle } from "lucide-react";

export function FAQ() {
  const { t } = useLanguage();

  const faqs = [
    {
      question: t('faq.q1'),
      answer: t('faq.a1')
    },
    {
      question: t('faq.q2'),
      answer: t('faq.a2')
    },
    {
      question: t('faq.q3'),
      answer: t('faq.a3')
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4')
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/30 to-black"></div>
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Icon */}
          <div className="liquid-icon mb-8 flex h-20 w-20 items-center justify-center rounded-full">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('faq.title')}
            </span>
          </h2>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="liquid-glass group overflow-hidden rounded-[1.75rem] border-none border-[1px] border-white/15 px-3 transition-all duration-500 data-[state=open]:border-orange-500/45"
            >
              <AccordionTrigger className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left text-lg text-white transition-colors duration-300 group-data-[state=open]:text-orange-300">
                <span className="flex items-center gap-4">
                  <span className="liquid-icon flex h-12 w-12 items-center justify-center rounded-2xl text-base font-semibold text-white/80">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span>{faq.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-5 text-base text-gray-300/85 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
