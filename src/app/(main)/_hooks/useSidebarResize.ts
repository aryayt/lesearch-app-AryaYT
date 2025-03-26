"use client";

import { useEffect, useCallback } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { useSidebar } from "@/components/ui/sidebar";

// Create a separate hook that safely wraps useSidebar
function useSafeContext<T>(useHook: () => T, defaultValue: T): T {
  try {
    return useHook();
  } catch {
    return defaultValue;
  }
}

export function useSidebarResize() {
  // Constants
  const DEFAULT_SIDEBAR_WIDTH = 256; // Default sidebar width in pixels
  
  const { 
    sidebarWidth, 
    setSidebarWidth, 
    setIsDragging, 
    isDragging,
    minSidebarWidth,
    maxSidebarWidth,
    minimize,
    setMinimize,
    prevSidebarWidth
  } = useLayoutStore();
  
  // Create a default sidebar context object with no-op functions
  const defaultSidebarContext = {
    state: "expanded" as const,
    open: true,
    setOpen: () => {},
    openMobile: false,
    setOpenMobile: () => {},
    isMobile: false,
    toggleSidebar: () => {}
  };
  
  // Use our safe context hook to get the sidebar context
  const sidebarContext = useSafeContext(useSidebar, defaultSidebarContext);
  const isValidContext = sidebarContext !== defaultSidebarContext;

  // Handle mouse move for resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Calculate new width based on mouse position
    const newWidth = e.clientX;
    
    // Update sidebar width within constraints
    setSidebarWidth(Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidth)));
    
    // Ensure sidebar is expanded when resizing
    if (minimize) {
      setMinimize(false);
    }
  }, [isDragging, minSidebarWidth, maxSidebarWidth, setSidebarWidth, minimize, setMinimize]);

  // Handle mouse up to stop resizing
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging, setIsDragging]);

  // Handle toggle minimize with width reset
  const toggleMinimize = useCallback(() => {
    if (isValidContext) {
      // Use the built-in toggleSidebar function if available
      sidebarContext.toggleSidebar();
    }
    
    if (minimize) {
      // When expanding, reset to default width
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
      setMinimize(false);
    } else {
      // Save current width before minimizing
      useLayoutStore.setState({ prevSidebarWidth: sidebarWidth });
      setMinimize(true);
    }
  }, [minimize, sidebarWidth, setSidebarWidth, setMinimize, sidebarContext, isValidContext]);

  // Handle sidebar toggle from SidebarTrigger
  useEffect(() => {
    // No need for this effect if we don't have access to sidebar context
    if (!isValidContext) return;
    
    // We can access the current state directly
    const isExpanded = sidebarContext.state === "expanded";
    
    // Set minimize state based on sidebar state
    if (isExpanded && minimize) {
      setMinimize(false);
    } else if (!isExpanded && !minimize) {
      setMinimize(true);
    }
    
  }, [minimize, setMinimize, sidebarContext, isValidContext]);

  // Handle rail mousedown for both drag and click
  const handleRailMouseDown = useCallback((e: React.MouseEvent) => {
    // Start dragging on mouse down
    setIsDragging(true);
    
    // Store the starting position
    const startX = e.clientX;
    
    // Flag to track if this was a drag or just a click
    let wasDragged = false;
    
    // Handle mouse move
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // If moved more than a few pixels, consider it a drag
      if (Math.abs(moveEvent.clientX - startX) > 3) {
        wasDragged = true;
      }
    };
    
    // Handle mouse up
    const handleMouseUp = (upEvent: MouseEvent) => {
      // Clean up listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // If this was a drag operation, prevent the click
      if (wasDragged) {
        // This prevents the upcoming click event
        upEvent.preventDefault();
        upEvent.stopPropagation();
        
        // Create a one-time click interceptor that will run before the rail's click handler
        const interceptClick = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
          document.removeEventListener('click', interceptClick, true);
        };
        
        // Add the interceptor with capture phase to catch it early
        document.addEventListener('click', interceptClick, true);
      }
      
      // Reset dragging state
      setIsDragging(false);
    };
    
    // Add temporary event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setIsDragging]);

  // Add event listeners when dragging starts
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Apply cursor style to the entire document when dragging
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    // Clean up event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    sidebarWidth,
    setSidebarWidth,
    isDragging,
    setIsDragging,
    minimize,
    setMinimize,
    toggleMinimize,
    minSidebarWidth,
    maxSidebarWidth,
    prevSidebarWidth,
    handleRailMouseDown
  };
}