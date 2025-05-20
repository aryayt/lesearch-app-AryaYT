"use client";

import { AppSidebar } from "./app-sidebar";
import Header from "./app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { PropsWithChildren } from "react";
import { useSidebarResize } from "../../hooks/useSidebarResize";
import { memo } from "react";

const LayoutWrapper = memo(function LayoutWrapper({
  children,
}: PropsWithChildren) {
  const { sidebarWidth, minimize } = useSidebarResize();

  return (
    <SidebarProvider
      defaultOpen={!minimize}
      style={{
        "--sidebar-width": `${sidebarWidth}px`,
      } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden transition-all duration-200 ease-in-out">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
});

LayoutWrapper.displayName = "LayoutWrapper";

export default LayoutWrapper;