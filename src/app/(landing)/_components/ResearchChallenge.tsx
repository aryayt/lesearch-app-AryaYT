"use client"

import { Clock, FileText, Briefcase, Link2 } from "lucide-react"
import { motion } from "framer-motion"
import { TextEffect } from "@/components/motion-primitives/text-effect"

const challenges = [
  {
    icon: Clock,
    title: "Time Wasted",
    description: "Hours spent searching for and accessing referenced papers, slowing down the research process.",
  },
  {
    icon: FileText,
    title: "Extraction Struggle",
    description: "Difficulty in quickly extracting key insights from lengthy academic papers and documents.",
  },
  {
    icon: Briefcase,
    title: "Organization Chaos",
    description: "Overwhelming task of managing and organizing numerous research papers and references.",
  },
  {
    icon: Link2,
    title: "Missing Connections",
    description: "Overlooking important connections between different research papers and concepts.",
  },
]

export default function ResearchChallenge() {
  return (
    <section id="challenges" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <TextEffect preset="fade-in-blur" as="h2" className="text-3xl sm:text-4xl font-bold mb-6 tracking-normal whitespace-pre-wrap">
            The Research Challenge
          </TextEffect>

          <TextEffect
            per="line"
            preset="fade-in-blur"
            delay={0.3}
            as="p"
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Many researchers spend up to 80% of their time tracking down referenced papers rather than analyzing
            content. This inefficiency affects students, professors, and professionals across disciplines.
          </TextEffect>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {challenges.map((challenge, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-xl p-6 shadow-lg border border-border"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { 
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                },
              }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-6 shadow-md">
                <challenge.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{challenge.title}</h3>
              <p className="text-muted-foreground">{challenge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}