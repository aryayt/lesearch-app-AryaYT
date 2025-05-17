"use client"

import { useEffect } from "react";
import Navigation from "@/components/landing-page/Navigation";
import Hero from "@/components/landing-page/Hero";
import ResearchChallenge from "@/components/landing-page/ResearchChallenge";
import HowLeSearchWorks from "@/components/landing-page/HowLeSearchWorks";
import Benefits from "@/components/landing-page/Benefits";
import Features from "@/components/landing-page/Features";
import Testimonials from "@/components/landing-page/Testimonials";
import FAQ from "@/components/landing-page/FAQ";
import Footer from "@/components/landing-page/Footer";

const LandingPage = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-in")
            }
          }
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px",
        },
      )

    const hiddenElements = document.querySelectorAll(".animate-hidden")
    for (const el of hiddenElements) {
        observer.unobserve(el)
      }

    return () => {
        for (const el of hiddenElements) {
            observer.unobserve(el)
          }
    }
  }, [])
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navigation />
      <Hero />
      <ResearchChallenge />
      <HowLeSearchWorks />
      <Benefits />
      <Features />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
};

export default LandingPage;
