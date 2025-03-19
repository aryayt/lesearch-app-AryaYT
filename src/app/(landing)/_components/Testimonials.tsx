"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { TextEffect } from "@/components/motion-primitives/text-effect"

const testimonials = [
  {
    name: "Emily Chen",
    role: "PhD Candidate in Neuroscience",
    university: "Stanford University",
    quote:
      "LeSearch's reference link parser saved me countless hours. I input a complex neurobiology paper, and it instantly extracted and organized all citations. Game-changer!",
    paper: "https://doi.org/10.1016/j.neuron.2021.05.002",
  },
  {
    name: "Jamal Thompson",
    role: "Master's Student in Computer Science",
    university: "MIT",
    quote:
      "The ability to parse reference links across multiple CS papers helped me identify key connections in AI research that I would have missed otherwise. LeSearch is indispensable.",
    paper: "https://doi.org/10.1145/3442188.3445922",
  },
  {
    name: "Sofia Rodriguez",
    role: "Doctoral Researcher in Climate Science",
    university: "ETH Zürich",
    quote:
      "LeSearch's reference parser doesn't just list citations; it creates a visual network of interconnected research. It's revolutionized how I approach literature reviews.",
    paper: "https://doi.org/10.1038/s41558-021-01097-4",
  },
  {
    name: "Alex Novak",
    role: "Postdoctoral Fellow in Quantum Physics",
    university: "Caltech",
    quote:
      "Parsing reference links across quantum computing papers used to take days. LeSearch does it in minutes, allowing me to focus on analysis rather than data collection.",
    paper: "https://doi.org/10.1038/s41586-019-1666-5",
  },
]

export default function Testimonials() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="testimonials" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 ">
          <TextEffect preset="fade-in-blur" as="h2" className="text-3xl sm:text-4xl font-bold mb-6 tracking-normal whitespace-pre-wrap">
            Empowering Research with Smart Citation Analysis
          </TextEffect>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-xl p-8 shadow-lg border border-border relative overflow-hidden "
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                bounce: 0.3,
              }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{
                y: -8,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.2 },
              }}
            >
              <div className="absolute top-0 left-0 w-20 h-20 bg-primary/10 rounded-full -ml-10 -mt-10"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/50 rounded-full -mr-10 -mb-10"></div>

              <div className="relative">
                <p className="text-lg mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">{testimonial.name}</h3>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                    <p className="text-muted-foreground">{testimonial.university}</p>
                  </div>
                  {hoveredIndex === index && (
                    <motion.a
                      href={testimonial.paper}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors duration-200 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      View Paper <ExternalLink className="ml-1 h-4 w-4" />
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg text-muted-foreground mb-6">
            Experience how LeSearch&apos;s reference link parser can transform your research process.
          </p>
          <motion.button
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg transition duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try LeSearch Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}