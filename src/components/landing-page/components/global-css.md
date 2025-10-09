@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Base Colors */
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  /* Typography */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  /* Brand Colors */
  --color-brand: var(--brand);
  --color-highlight: var(--highlight);

  /* Primary Colors */
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);

  /* Secondary Colors */
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);

  /* Accent Colors */
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);

  /* Muted Colors */
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  /* Card Colors */
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);

  /* Popover Colors */
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);

  /* Border & Ring */
  --color-border: var(--border);
  --color-ring: var(--ring);

  /* Input & Destructive */
  --color-input: var(--input);
  --color-destructive: var(--destructive);

  /* Chart Colors */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  /* Sidebar Colors */
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Border Radius */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --animate-rainbow: rainbow var(--speed, 2s) infinite linear;
  --color-color-5: var(--color-5);
  --color-color-4: var(--color-4);
  --color-color-3: var(--color-3);
  --color-color-2: var(--color-2);
  --color-color-1: var(--color-1);
  @keyframes rainbow {
  0% {
    background-position: 0%;
    }
  100% {
    background-position: 200%;
    }
  }
}

:root {
  /* Base Colors */

  /* Brand Colors */
  --brand: #3b94e4;
  --highlight: #1fb166;

  /* Primary Colors */
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);

  /* Secondary Colors */
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);

  /* Accent Colors */
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);

  /* Muted Colors */
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);

  /* Card Colors */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);

  /* Popover Colors */
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);

  /* Border & Ring */
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);

  /* Input & Destructive */
  --input: oklch(0.922 0 0);
  --destructive: oklch(0.577 0.245 27.325);

  /* Chart Colors */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);

  /* Sidebar Colors */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);

  /* Border Radius */
  --radius: 0.625rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

   /* Grid Pattern - Light Mode (Brighter) */
   --grid-color: rgba(0,0,0,0.08);

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --color-1: oklch(66.2% 0.225 25.9);
  --color-2: oklch(60.4% 0.26 302);
  --color-3: oklch(69.6% 0.165 251);
  --color-4: oklch(80.2% 0.134 225);
  --color-5: oklch(90.7% 0.231 133);
}

.dark {
  /* Base Colors */
  --background: oklch(0.205 0 0);
  --foreground: oklch(0.985 0 0);

  /* Brand Colors */
  --brand: #60A5FA;
  --highlight: #4ADE80;

  /* Primary Colors */
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);

  /* Secondary Colors */
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);

  /* Accent Colors */
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);

  /* Muted Colors */
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);

  /* Card Colors */
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);

  /* Popover Colors */
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);

  /* Border & Ring */
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.556 0 0);

  /* Input & Destructive */
  --input: oklch(1 0 0 / 15%);
  --destructive: oklch(0.704 0.191 22.216);

  /* Chart Colors */
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);

  /* Sidebar Colors */
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.5);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.7);

  /* Grid Pattern - Dark Mode (Much Brighter) */
  --grid-color: rgba(255,255,255,0.08);

  --color-1: oklch(66.2% 0.225 25.9);
  --color-2: oklch(60.4% 0.26 302);
  --color-3: oklch(69.6% 0.165 251);
  --color-4: oklch(80.2% 0.134 225);
  --color-5: oklch(90.7% 0.231 133);
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  background-color: var(--background);
  color: var(--text-primary);
  transition: background-color var(--duration-normal) var(--ease-out), 
              color var(--duration-normal) var(--ease-out);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.grid-pattern {
  background-image: 
    linear-gradient(var(--grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
  background-size: 120px 120px;
  background-position: -1px -1px;

}

/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@layer utilities {
  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  /* Marquee animation utility */
  .animate-marquee {
    animation: marquee 60s linear infinite;
  }

  .animate-marquee:hover {
    animation-play-state: paused;
  }

  /* Faster marquee animation for testimonials */
  .animate-marquee-fast {
    animation: marquee 30s linear infinite;
  }

  .animate-marquee-fast:hover {
    animation-play-state: paused;
  }

  /* Gradient mask for better testimonial transitions */
  .mask-gradient-horizontal {
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 5%,
      black 95%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 5%,
      black 95%,
      transparent 100%
    );
  }
}
