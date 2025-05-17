"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { AnimatedGroup } from "@/components/motion-primitives/animated-group"
import { motion } from "framer-motion"
import Logo from '@/components/logo'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md py-3 shadow-md" : "bg-transparent py-5"
      }`}
    >
      <AnimatedGroup
        variants={{
          container: {
            visible: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.2,
              },
            },
          },
          item: {
            hidden: {
              opacity: 0,
              y: -10,
            },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                bounce: 0.3,
                duration: 0.6,
              },
            },
          },
        }}
        className="container mx-auto px-4 flex items-center justify-between"
      >
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold">
            <Logo />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">LeSearch</span>
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:space-x-8">
          <nav className="flex space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#benefits" className="text-sm font-medium hover:text-primary transition-colors">
              Benefits
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Testimonials
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10" asChild>
          <Link href="/signup">
            Sign Up
          </Link>
          </Button>
          <Button size="sm" className="bg-primary hover:bg-sidebar-primary" asChild>
            <Link href="/login">
            Login
            </Link>
          </Button>
          <ModeToggle />
        </div>

        <div className="md:hidden flex items-center space-x-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)} className="text-foreground">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </AnimatedGroup>

      {/* Mobile menu */}
      <motion.div
        className={`fixed inset-0 z-50 bg-background md:hidden ${isMenuOpen ? "block" : "hidden"}`}
        initial={{ opacity: 0, x: "100%" }}
        animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold">
            <Search className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-sidebar-primary bg-clip-text text-transparent">LeSearch</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="text-foreground">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex flex-col p-4 space-y-4">
          <Link
            href="#features"
            className="text-lg font-medium p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-lg font-medium p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="#benefits"
            className="text-lg font-medium p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Benefits
          </Link>
          <Link
            href="#testimonials"
            className="text-lg font-medium p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Testimonials
          </Link>
          <div className="pt-4 border-t border-border flex flex-col space-y-4">
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" asChild>
              <Link href="/signup">
                Sign Up
              </Link>
            </Button>
            <Button className="w-full bg-primary hover:bg-sidebar-primary" asChild>
              <Link href="/login">
            Login
            </Link></Button>
          </div>
        </nav>
      </motion.div>
    </header>
  )
}