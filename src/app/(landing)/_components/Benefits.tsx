"use client"

import { useState } from "react"
import { GraduationCap, Building2, Briefcase, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { TextEffect } from "@/components/motion-primitives/text-effect"

const benefitsData = {
  students: [
    "Complete literature reviews 50% faster",
    "Access millions of papers with one click",
    "Generate citations automatically",
    "Understand complex topics more easily",
  ],
  professors: [
    "Verify references quickly and accurately",
    "Build comprehensive reading lists effortlessly",
    "Stay updated on the latest research in your field",
    "Collaborate seamlessly with colleagues and students",
  ],
  professionals: [
    "Access source material instantly",
    "Extract key insights from large documents",
    "Generate comprehensive reports faster",
    "Make data-driven decisions with confidence",
  ],
}

type UserType = "students" | "professors" | "professionals"

export default function Benefits() {
  const [activeTab, setActiveTab] = useState<UserType>("students")

  const TabIcon = ({ type }: { type: UserType }) => {
    switch (type) {
      case "students":
        return <GraduationCap className="w-5 h-5" />
      case "professors":
        return <Building2 className="w-5 h-5" />
      case "professionals":
        return <Briefcase className="w-5 h-5" />
    }
  }

  return (
    <section id="benefits" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"/>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 animate-hidden">
          <TextEffect preset="fade-in-blur" as="h2" className="text-3xl sm:text-4xl font-bold mb-6 tracking-normal whitespace-pre-wrap">
            Why Researchers Choose LeSearch
          </TextEffect>

          <TextEffect
            per="line"
            preset="fade-in-blur"
            delay={0.3}
            as="p"
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Tailored benefits for different types of researchers
          </TextEffect>
        </div>

        <motion.div
          className="flex flex-col md:flex-row justify-center mb-8 border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {(["students", "professors", "professionals"] as const).map((type) => (
            <button
            type="button"
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center justify-center py-4 px-8 text-lg font-medium transition-all duration-300 relative ${
                activeTab === type ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TabIcon type={type} />
              <span className="ml-2 capitalize">{type}</span>
              {activeTab === type && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        <div className="bg-card rounded-xl p-8 shadow-lg border border-border overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px] flex items-center"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <ul className="space-y-6">
                  {benefitsData[activeTab].slice(0, 2).map((benefit, index) => (
                    <li key={`${index}_${benefit}`}>
                      <motion.div
                        className="flex items-start"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="mr-4 mt-1 bg-chart-1/20 rounded-full p-1">
                          <Check className="w-5 h-5 text-chart-1" />
                        </div>
                        <span className="text-lg">{benefit}</span>
                      </motion.div>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-6">
                  {benefitsData[activeTab].slice(2).map((benefit, index) => (
                    <li key={`${index}_${benefit}`}>
                      <motion.div
                        className="flex items-start"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index + 2) * 0.1 }}
                      >
                        <div className="mr-4 mt-1 bg-chart-1/20 rounded-full p-1">
                          <Check className="w-5 h-5 text-chart-1" />
                        </div>
                        <span className="text-lg">{benefit}</span>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}