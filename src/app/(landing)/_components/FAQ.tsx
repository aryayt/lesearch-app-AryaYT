"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { TextEffect } from "@/components/motion-primitives/text-effect"

const faqs = [
  {
    question: "How does LeSearch retrieve referenced papers?",
    answer:
      "LeSearch uses advanced AI algorithms to scan and analyze research papers, extracting references and automatically retrieving the full text when available. It accesses multiple academic databases and open-access repositories to find the most up-to-date versions of referenced papers.",
  },
  {
    question: "What if a referenced paper isn't publicly available?",
    answer:
      "If a paper isn't publicly accessible, LeSearch will provide as much information as possible, including the abstract, publication details, and any available snippets. It also suggests alternative sources or related open-access papers that might contain similar information.",
  },
  {
    question: "Can LeSearch understand papers in specialized fields?",
    answer:
      "Yes, LeSearch is trained on a vast array of academic literature across various disciplines. It can understand and analyze papers from highly specialized fields, including medicine, physics, computer science, and more. The AI continuously learns and updates its knowledge base to stay current with the latest research trends.",
  },
  {
    question: "How accurate are the answers when I ask questions about references?",
    answer:
      "LeSearch strives for high accuracy in its responses. It uses context-aware natural language processing to understand your questions and extract relevant information from the papers. While accuracy can vary depending on the complexity of the question, LeSearch typically provides highly reliable answers, always citing the specific sections of papers it references.",
  },
  {
    question: "Is there a limit to how many papers I can analyze?",
    answer:
      "The number of papers you can analyze depends on your subscription plan. Free accounts can analyze up to 5 papers per month, while premium plans offer higher or unlimited analysis quotas. LeSearch also offers custom enterprise solutions for organizations with high-volume research needs.",
  },
]

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
  index: number;
}

const FAQItem = ({ question, answer, isOpen, toggleOpen, index }: FAQItemProps) => (
  <motion.div
    className="border-b border-border overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <button className="flex justify-between items-center w-full py-5 text-left focus:outline-none" onClick={toggleOpen}>
      <span className="font-medium text-lg">{question}</span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="py-4 text-muted-foreground">{answer}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-hidden">
          <TextEffect preset="fade-in-blur" as="h2" className="text-3xl sm:text-4xl font-bold mb-6">
            Frequently Asked Questions
          </TextEffect>
        </div>

        <div className="max-w-3xl mx-auto bg-card rounded-xl p-8 shadow-lg border border-border">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggleOpen={() => setOpenIndex(openIndex === index ? null : index)}
              index={index}
            />
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg mb-2">Have more questions?</p>
          <a href="#" className="text-primary hover:text-primary/80 font-medium">
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  )
}
