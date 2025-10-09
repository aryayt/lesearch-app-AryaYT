"use client";

import type { PropsWithChildren } from "react";
import { memo } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarResize } from "../../hooks/useSidebarResize";
import Header from "./app-header";
import { AppSidebar } from "./app-sidebar";

const LayoutWrapper = memo(function LayoutWrapper({
	children,
}: PropsWithChildren) {
	const { sidebarWidth, minimize } = useSidebarResize();

	return (
		<SidebarProvider
			defaultOpen={!minimize}
			style={
				{
					"--sidebar-width": `${sidebarWidth}px`,
				} as React.CSSProperties
			}
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
