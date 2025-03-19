"use client"

import { FileText, BookOpen, MessageSquare, Network, Search, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { TextEffect } from "@/components/motion-primitives/text-effect"

// Mapping colors to design tokens
const colorTokenMap = {
  blue: { bg: "bg-blue-500/20", text: "text-blue-500" },
  indigo: { bg: "bg-indigo-500/20", text: "text-indigo-500" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-500" },
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-500" },
  green: { bg: "bg-green-500/20", text: "text-green-500" },
}

const features = [
  {
    title: "One-Click Reference Retrieval",
    description: "Access full-text papers instantly with a single click.",
    icon: FileText,
    color: "blue",
  },
  {
    title: "Reference Library",
    description: "Organize and manage your research materials effortlessly.",
    icon: BookOpen,
    color: "indigo",
  },
  {
    title: "AI-Powered Q&A",
    description: "Get instant answers to your research questions.",
    icon: MessageSquare,
    color: "purple",
  },
  {
    title: "Citation Network Visualization",
    description: "Discover connections between papers and identify key influencers in your field.",
    icon: Network,
    color: "cyan",
  },
  {
    title: "Semantic Search",
    description: "Find relevant papers based on meaning, not just keywords.",
    icon: Search,
    color: "green",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"/>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <TextEffect preset="fade-in-blur" as="h2" className="text-3xl sm:text-4xl font-bold mb-6 tracking-normal whitespace-pre-wrap">
            Powerful Tools for Smarter Research
          </TextEffect>

          <TextEffect
            per="line"
            preset="fade-in-blur"
            delay={0.3}
            as="p"
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            LeSearch helps you find, understand, and organize information faster than ever before.
          </TextEffect>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={`${index}_${feature}`}
              className="bg-card rounded-xl p-6 shadow-lg border border-border relative overflow-hidden"
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
              <div
                className={`w-12 h-12 ${colorTokenMap[feature.color as keyof typeof colorTokenMap].bg} rounded-full flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-6 h-6 ${colorTokenMap[feature.color as keyof typeof colorTokenMap].text}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}

          <motion.div
            className="bg-card rounded-xl p-6 shadow-lg border border-destructive/50 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.5,
              delay: features.length * 0.1,
              type: "spring",
              bounce: 0.3,
            }}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              transition: { duration: 0.2 },
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full -mr-16 -mt-16"/>
            <div className="relative">
              <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">Exciting new features on the horizon. Stay tuned!</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}