"use client"

import { useEffect } from "react";
import Navigation from "./_components/Navigation";
import Hero from "./_components/Hero";
import ResearchChallenge from "./_components/ResearchChallenge";
import HowLeSearchWorks from "./_components/HowLeSearchWorks";
import Benefits from "./_components/Benefits";
import Features from "./_components/Features";
import Testimonials from "./_components/Testimonials";
import FAQ from "./_components/FAQ";
import Footer from "./_components/Footer";

const LandingPage = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    const hiddenElements = document.querySelectorAll(".animate-hidden")
    hiddenElements.forEach((el) => observer.observe(el))

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el))
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
