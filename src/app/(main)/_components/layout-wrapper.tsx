"use client";

import { AppSidebar } from "./sidebar/app-sidebar";
import Header from "./header/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { PropsWithChildren } from "react";
import { useSidebarResize } from "@/app/(main)/_hooks/useSidebarResize";


export default function LayoutWrapper({
  children,
}: PropsWithChildren) {
  const { sidebarWidth, minimize } = useSidebarResize();

  return (
    <SidebarProvider
     defaultOpen={!minimize}
      style={{
        "--sidebar-width": `${sidebarWidth}px`,
        "--sidebar-width-icon": "0px",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 transition-all duration-200 ease-in-out">
          {children}
          
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}