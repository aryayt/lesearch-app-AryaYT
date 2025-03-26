"use client";

import { AppSidebar } from "./sidebar/app-sidebar";
import Header from "./header/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserMetadata } from "@supabase/supabase-js";
import type { PropsWithChildren } from "react";
import { useSidebarResize } from "@/app/(main)/_hooks/useSidebarResize";


export default function LayoutWrapper({
  children,
  currentUser,
}: PropsWithChildren & {
  currentUser: UserMetadata;
}) {
  const { sidebarWidth } = useSidebarResize();

  return (
    <SidebarProvider
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
          <div className="mt-4 text-sm text-muted-foreground">
            Hello {currentUser.firstname}!!
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}