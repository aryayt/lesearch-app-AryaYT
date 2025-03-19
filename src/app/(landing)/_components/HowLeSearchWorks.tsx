"use client"

import { Search, FileText, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { TextEffect } from "@/components/motion-primitives/text-effect"

const features = [
  {
    icon: Search,
    title: "Intelligent Reference Retrieval",
    description:
      "Our AI understands the context of your research questions and finds the most relevant references instantly.",
  },
  {
    icon: FileText,
    title: "Instant Analysis",
    description: "Extract key insights, summaries, and answers within seconds from any referenced document.",
  },
  {
    icon: FolderOpen,
    title: "Smart Organization",
    description: "Automatically organize your references by themes, concepts, and relationships for easy access.",
  },
]

export default function HowLeSearchWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 animate-hidden">
                <TextEffect 
          preset="fade-in-blur" 
          as="h2" 
          className="text-3xl sm:text-4xl font-bold mb-6 tracking-normal whitespace-pre-wrap"
        >
          How LeSearch Works
        </TextEffect>

          <TextEffect
            per="line"
            preset="fade-in-blur"
            delay={0.3}
            as="p"
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            LeSearch uses advanced AI to transform how you handle research references, letting you focus on insights
            rather than chasing citations.
          </TextEffect>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-xl p-8 shadow-lg border border-border relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                bounce: 0.3,
              }}
              whileHover={{
                y: -8,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.2 },
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            See how it works
          </Button>
        </motion.div>
      </div>
    </section>
  )
}