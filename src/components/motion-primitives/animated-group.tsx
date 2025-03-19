"use client"

import React from "react"
import { motion, type Variants } from "framer-motion"

interface AnimatedGroupProps {
  children: React.ReactNode
  className?: string
  variants?: {
    container?: Variants
    item?: Variants
  }
}

export function AnimatedGroup({ children, className, variants }: AnimatedGroupProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={variants?.container} className={className}>
      {React.Children.map(children, (child, i) => {
        if (React.isValidElement(child)) {
          return (
            <motion.div key={i} variants={variants?.item}>
              {child}
            </motion.div>
          )
        }
        return child
      })}
    </motion.div>
  )
}

