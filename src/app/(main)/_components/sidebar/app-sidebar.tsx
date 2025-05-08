"use client"

import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavWorkspaces } from "./nav-workspaces"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import SidebarUser from "./sidebar-user"
import { useSidebarResize } from "./_hooks/useSidebarResize"

// This is sample data.
// const data = {
//   navMain: [
//     {
//       title: "Search",
//       url: "#",
//       icon: Search,
//     },
//     {
//       title: "Ask AI",
//       url: "#",
//       icon: Sparkles,
//     },
//     {
//       title: "Home",
//       url: "#",
//       icon: Home,
//       isActive: true,
//     },
//     {
//       title: "Inbox",
//       url: "#",
//       icon: Inbox,
//       badge: "10",
//     },
//   ],
//   favorites: [
//     {
//       name: "Project Management & Task Tracking",
//       url: "#",
//       emoji: "📊",
//     },
//     {
//       name: "Family Recipe Collection & Meal Planning",
//       url: "#",
//       emoji: "🍳",
//     },
//     {
//       name: "Fitness Tracker & Workout Routines",
//       url: "#",
//       emoji: "💪",
//     },
//     {
//       name: "Book Notes & Reading List",
//       url: "#",
//       emoji: "📚",
//     },
//     {
//       name: "Sustainable Gardening Tips & Plant Care",
//       url: "#",
//       emoji: "🌱",
//     },
//     {
//       name: "Language Learning Progress & Resources",
//       url: "#",
//       emoji: "🗣️",
//     },
//     {
//       name: "Home Renovation Ideas & Budget Tracker",
//       url: "#",
//       emoji: "🏠",
//     },
//     {
//       name: "Personal Finance & Investment Portfolio",
//       url: "#",
//       emoji: "💰",
//     },
//     {
//       name: "Movie & TV Show Watchlist with Reviews",
//       url: "#",
//       emoji: "🎬",
//     },
//     {
//       name: "Daily Habit Tracker & Goal Setting",
//       url: "#",
//       emoji: "✅",
//     },
//   ],
// }

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const {  handleRailMouseDown } = useSidebarResize();
  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarUser  />
        <NavMain />
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto">
          {/* <NavFavorites favorites={data.favorites} /> */}
          <NavWorkspaces />
        </div>
        <div className="bg-sidebar sticky bottom-0">
          <NavSecondary />
        </div>
      </SidebarContent>
      <SidebarRail 
        onMouseDown={(e) => {
          handleRailMouseDown(e);
        }}
      />
    </Sidebar>
  )
}
