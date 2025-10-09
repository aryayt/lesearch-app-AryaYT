"use client";

import { useEffect } from "react";
import Benefits from "@/components/landing-page/Benefits";
import FAQ from "@/components/landing-page/FAQ";
import Features from "@/components/landing-page/Features";
import Footer from "@/components/landing-page/Footer";
import Hero from "@/components/landing-page/Hero";
import HowLeSearchWorks from "@/components/landing-page/HowLeSearchWorks";
import Navigation from "@/components/landing-page/Navigation";
import ResearchChallenge from "@/components/landing-page/ResearchChallenge";
import Testimonials from "@/components/landing-page/Testimonials";

const LandingPage = () => {
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("animate-in");
					}
				}
			},
			{
				threshold: 0.1,
				rootMargin: "0px 0px -100px 0px",
			},
		);

		const hiddenElements = document.querySelectorAll(".animate-hidden");
		for (const el of hiddenElements) {
			observer.unobserve(el);
		}

		return () => {
			for (const el of hiddenElements) {
				observer.unobserve(el);
			}
		};
	}, []);
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
