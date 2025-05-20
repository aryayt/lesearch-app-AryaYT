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

  // Destructure the needed functions from panelStore
  const { setActivePageId, addTab, setMiddleActiveTabId, setLeftActiveTabId } =
    panelStore;

  // Create memoized handlers for getting panel tabs
  const getTabsInfo = useCallback(() => {
    return {
      leftTabs: panelStore.getLeftPanelTabs(),
      middleTabs: panelStore.getMiddlePanelTabs(),
    };
  }, [panelStore]);

  useEffect(() => {
    if (!pageId || processedRef.current.has(pageId as string)) return;

    const handlePageChange = async () => {
      setLoading(true);

      try {
        const page = allItems.find((item) => item.id === pageId);
        if (!page) {
          console.log("Page not found in allItems:", pageId);
          return;
        }

        // Get tabs information
        const { leftTabs, middleTabs } = getTabsInfo();

        setActiveItem(pageId as string);
        setActivePageId(pageId as string);

        // Add tab if needed
        if (page.type && !leftTabs.find((tab) => tab.id === pageId)) {
          await addTab(pageId as string, page.type as "pdf" | "note", "left");
          setLeftActiveTabId(pageId as string);
        }

        // Set middle tab if available
        if (middleTabs.length > 0) {
          setMiddleActiveTabId(middleTabs[0].id);
        }

        // Mark this pageId as processed
        processedRef.current.add(pageId as string);
      } catch (error) {
        console.error("Error in DashboardLayout effect:", error);
      } finally {
        setLoading(false);
      }
    };

    handlePageChange();
  }, [
    pageId,
    allItems,
    setActiveItem,
    setActivePageId,
    addTab,
    setMiddleActiveTabId,
    setLeftActiveTabId,
    getTabsInfo,
  ]);

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
