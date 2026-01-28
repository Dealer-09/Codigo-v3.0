"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

const faqs = [
    {
        question: "What specific coding difficulties do?",
        answer: "Our platform covers algorithmic challenges, system design, frontend, and backend tasks tailored to your role."
    },
    {
        question: "How does the AI provide customized feedback?",
        answer: "It analyzes your code structure, time complexity, and style to offer personalized tips and refactoring suggestions."
    },
    {
        question: "Is there a free tier available?",
        answer: "Yes, we offer a generous free tier for individuals to practice and compete in community challenges."
    },
    {
        question: "Can I use this platform for hiring?",
        answer: "Absolutely! We provide enterprise solutions for technical assessments and live coding interviews."
    },
    {
        question: "How do I get started with the platform?",
        answer: "Sign up for free, choose your language, and start solving your first challenge in under 2 minutes."
    },
];

export const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faqs" className="py-24 bg-[#0a0a0a]">
            <div className="container mx-auto px-6 grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Frequently Asked <br />
                        Questions <span className="text-blue-500">(FAQs)</span>
                    </h2>
                    <p className="mb-8 text-gray-400">
                        Still have questions? More detail? Feel free to browse our help center.
                    </p>
                    <button className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                        Contact Us
                    </button>
                </div>

                <div className="lg:col-span-7 space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="overflow-hidden rounded-xl border border-white/10 bg-[#111]">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/5"
                            >
                                <span className="font-medium text-gray-200">{faq.question}</span>
                                <ChevronDown
                                    className={`h-5 w-5 text-gray-500 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
