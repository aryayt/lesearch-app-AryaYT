import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { StoreInitializer } from "@/components/providers/IntiUserStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lesearch-app.vercel.app'),
  title: "LeSearch - Less Search, More Knowledge",
  description: "LeSearch is an AI-powered research assistant that helps users summarize, analyze, and interact with documents efficiently.",
  keywords: [
    "LeSearch",
    "AI research assistant",
    "document summarization",
    "AI-powered search",
    "Less Search",
  ],
  openGraph: {
    title: "LeSearch - AI Research Assistant",
    description: "LeSearch simplifies document understanding with AI-driven insights, summaries, and interactive Q&A.",
    url: "https://lesearch-app.vercel.app", 
    type: "website",
    images: [
      {
        url: "/lesearch-banner.jpg",
        width: 1200,
        height: 630,
        alt: "LeSearch AI Research Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeSearch - AI Research Assistant",
    description: "Save time and enhance research efficiency with AI-driven document analysis and summarization.",
    images: ["/logo/Lesearch Logo.svg"],
  },
  icons: {
    icon: "/logo/Lesearch Logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <StoreInitializer />
        <Toaster />
      </body>
    </html>
  );
}
