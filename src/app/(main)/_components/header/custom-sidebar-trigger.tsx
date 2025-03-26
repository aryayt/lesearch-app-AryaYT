"use client";

import { SidebarTrigger as OriginalSidebarTrigger } from "@/components/ui/sidebar";
import { useSidebarResize } from "@/app/(main)/_hooks/useSidebarResize";
import { useEffect } from "react";
import { useLayoutStore } from "@/store/layoutStore";

// This component wraps the original SidebarTrigger to add reset width functionality
export function CustomSidebarTrigger(props: React.ComponentProps<typeof OriginalSidebarTrigger>) {
  const { 
    setSidebarWidth, 
    minimize,
    sidebarWidth,
    toggleMinimize
  } = useSidebarResize();
  
  const DEFAULT_WIDTH = 256;
  
  // Listen for sidebar state changes
  useEffect(() => {
    // When the sidebar is toggled, we need to:
    // 1. Save the current width if collapsing
    // 2. Reset to default width if expanding
    
    const handleSidebarChange = () => {
      if (!minimize) {
        // If sidebar is now expanded, reset width
        setSidebarWidth(DEFAULT_WIDTH);
      }
    };
    
    // Call handler immediately in case minimize state has already changed
    handleSidebarChange();
  }, [minimize, setSidebarWidth]);
  
  // Custom click handler that wraps the original
  const handleClick = (e: React.MouseEvent) => {
    // Save current width before toggling if expanded
    if (!minimize) {
      useLayoutStore.setState({ prevSidebarWidth: sidebarWidth });
    }
    
    // Toggle the minimize state
    toggleMinimize();
    
    // Call the original onClick if provided
    if (props.onClick) {
      props.onClick(e as React.MouseEvent<HTMLButtonElement, MouseEvent>);
    }
  };
  
  return (
    <OriginalSidebarTrigger
      {...props}
      onClick={handleClick}
    />
  );
}