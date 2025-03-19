"use client"

import React from "react"
import { motion, type Variants } from "framer-motion"

interface TextEffectProps {
  children: React.ReactNode
  as?: React.ElementType
  className?: string
  preset?: "fade-in-blur" | "slide-up" | "slide-down"
  per?: "word" | "line" | "character"
  delay?: number
  speedSegment?: number
}

export function TextEffect({
  children,
  as: Component = "div",
  className,
  preset = "fade-in-blur",
  per = "word",
  delay = 0,
  speedSegment = 0.1,
}: TextEffectProps) {
  const text = React.useMemo(() => {
    if (typeof children !== "string") {
      return [children]
    }

    if (per === "word") {
      return children.split(" ").map((word) => `${word} `)
    } else if (per === "line") {
      return children.split("\n")
    } else {
      return children.split("")
    }
  }, [children, per])

  const getVariants = (): Variants => {
    switch (preset) {
      case "fade-in-blur":
        return {
          hidden: {
            opacity: 0,
            filter: "blur(8px)",
            y: 10,
          },
          visible: (i: number) => ({
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
              delay: delay + i * speedSegment,
              duration: 0.8,
              ease: [0.215, 0.61, 0.355, 1],
            },
          }),
        }
      case "slide-up":
        return {
          hidden: {
            opacity: 0,
            y: 20,
          },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: delay + i * speedSegment,
              duration: 0.5,
            },
          }),
        }
      case "slide-down":
        return {
          hidden: {
            opacity: 0,
            y: -20,
          },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: delay + i * speedSegment,
              duration: 0.5,
            },
          }),
        }
      default:
        return {}
    }
  }

  const variants = getVariants()

  return (
    <Component className={className}>
      <motion.span initial="hidden" animate="visible" style={{ display: "inline-block" }}>
        {text.map((segment, i) => (
          <motion.span key={i} custom={i} variants={variants} style={{ display: "inline-block" }}>
            {segment}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  )
}

