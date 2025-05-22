"use client";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useStore } from "@/store/useCollectionStore";
import { usePanelStore } from "@/store/usePanelStore";
import { Loader2 } from "lucide-react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { pageId } = useParams();
  const { allItems, setActiveItem } = useStore();
  const panelStore = usePanelStore();
  const [loading, setLoading] = useState(false);
  const processedRef = useRef(new Set<string>());
  const isLoadingRef = useRef(false);

  // Get panel functions directly
  const { setActivePageId, addTab, setMiddleActiveTabId, setLeftActiveTabId } = panelStore;

  const loadPage = useCallback(async () => {
    if (
      !pageId ||
      processedRef.current.has(pageId as string) ||
      isLoadingRef.current
    ) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const page = allItems.find((item) => item.id === pageId);
      if (!page) {
        console.log("Page not found in allItems:", pageId);
        return;
      }

      // Set active states
      setActiveItem(pageId as string);
      setActivePageId(pageId as string);

      // Get tab information once here, not inside an effect
      const leftTabs = panelStore.getLeftPanelTabs();
      const middleTabs = panelStore.getMiddlePanelTabs();

      // Add tab if needed
      if (page.type && !leftTabs.find((tab) => tab.id === pageId)) {
        await addTab(pageId as string, page.type as "pdf" | "note", "left");
        setLeftActiveTabId(pageId as string);
      }

      // Set middle tab if available
      if (middleTabs && middleTabs.length > 0) {
        setMiddleActiveTabId(middleTabs[0].id);
      }

      // Mark as processed
      processedRef.current.add(pageId as string);
    } catch (error) {
      console.error("Error loading page:", error);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [pageId, allItems, setActiveItem, setActivePageId, addTab, setMiddleActiveTabId, setLeftActiveTabId, panelStore]);

  // Run effect only once per pageId
  useEffect(() => {
    if (!pageId) {
      setActiveItem(null);
      setActivePageId("");
      return;
    }

    loadPage();
  }, [pageId, loadPage, setActiveItem, setActivePageId]);

  return (
    <div className="h-full w-full flex">
      {loading ? (
        <div className="flex items-center justify-center h-full w-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default DashboardLayout;
