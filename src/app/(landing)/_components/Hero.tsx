"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextEffect } from "@/components/motion-primitives/text-effect"
import { AnimatedGroup } from "@/components/motion-primitives/animated-group"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <div className="relative overflow-hidden pt-20">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-orange-500/10 opacity-30"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3,
                  },
                },
              },
              item: {
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    bounce: 0.4,
                    duration: 0.8,
                  },
                },
              },
            }}
          >
            <div className="inline-flex items-center px-3 py-1.5 mb-6 rounded-full text-sm font-medium bg-blue-900/40 text-blue-300 backdrop-blur-sm border border-blue-800/50">
              <span className="mr-2">⚡</span> Backed by top AI researchers
            </div>

            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.1}
              as="h1"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6"
            >
              <span className="block font-normal">Less searching.</span>
              <span className="block text-blue-500">More finding.</span>
            </TextEffect>

            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.1}
              delay={0.5}
              as="p"
              className="text-xl text-muted-foreground mb-6"
            >
              Research simplified for the information you actually need.
            </TextEffect>

            <p className="text-lg text-muted-foreground/80 mb-8">
              Find references instantly. LeSearch helps you access cited papers with a single click and get answers to
              your questions directly from your research documents.
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Upload Paper
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/5"
              >
                Contact Sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </AnimatedGroup>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              type: "spring",
              bounce: 0.3,
            }}
            className="mt-12 lg:mt-0"
          >
            <div className="relative mx-auto w-full max-w-md">
              <div className="bg-card rounded-lg shadow-xl overflow-hidden border border-border">
                <div className="p-1 bg-muted">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/50"></div>
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/50"></div>
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/50"></div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
                      Understanding Quantum Computing
                    </h3>
                    <div className="flex space-x-3">
                      <Button
                        title="btn"
                        type="button"
                        className="text-muted-foreground bg-transparent hover:text-primary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        </svg>
                      </Button>
                      <Button
                        title="btn"
                        type="button"
                        className="text-muted-foreground bg-transparent hover:text-primary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M5 4a1 1 0 011-1h8a1 1 0 011 1v1H5V4zM4 6a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V7a1 1 0 00-1-1H4z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-secondary-foreground font-medium">U</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-card-foreground bg-muted p-3 rounded-lg rounded-tl-none">
                          What are the key differences between quantum and classical computing?
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">L</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-card-foreground bg-secondary p-3 rounded-lg rounded-tl-none">
                          <span className="font-semibold block mb-1">Key differences:</span>
                          1. <span className="text-primary">Quantum bits (qubits)</span> can exist in multiple states
                          simultaneously due to superposition, while classical bits are binary (0 or 1).
                          <br />
                          2. <span className="text-primary">Quantum entanglement</span> allows qubits to be correlated
                          in ways impossible for classical bits.
                          <br />
                          3. <span className="text-primary">Quantum parallelism</span> enables certain calculations to
                          be performed exponentially faster than classical computers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                         {/* Floating elements */}
              <motion.div
                className="absolute -right-6 -top-6 bg-blue-500/80 backdrop-blur-md p-3 rounded-lg shadow-lg text-white text-sm font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                98% faster research
              </motion.div>

              <motion.div
                className="absolute -left-6 bottom-24 bg-orange-500/80 backdrop-blur-md p-3 rounded-lg shadow-lg text-white text-sm font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                One-click access
              </motion.div>
              </div>
            {/* </div> */}

     
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

