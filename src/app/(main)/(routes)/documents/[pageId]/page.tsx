"use client";
import { useEffect, useState } from "react";
import LeftPanel from "@/components/panels/left-panel";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import MiddlePanel from "@/components/panels/middle-panel";
import RightPanel from "@/components/panels/right-panel";
import { usePanelStore } from "@/store/usePanelStore";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { SearchDialog } from "@/components/dialog/searchDialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const DashboardPage = () => {
  const { activePageId, getPanelVisibility, setActivePageId } = usePanelStore();
  const params = useParams();
  const pageId = params?.pageId as string;
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const middlePanelRef = useRef<ImperativePanelHandle>(null);
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  // Set the active page ID when the component mounts
  useEffect(() => {
    if (pageId) {
      setActivePageId(pageId);
    }
  }, [pageId, setActivePageId]);

  // Get the panel visibility state for this page
  const { showMiddlePanel, showRightPanel } = getPanelVisibility(pageId);

  // Adjust panel sizes when visibility changes
  useEffect(() => {
    // Give the left panel full width when other panels are hidden
    if (!showMiddlePanel && !showRightPanel && leftPanelRef.current) {
      setTimeout(() => {
        leftPanelRef.current?.resize(100);
      }, 0);
    }

    // Give middle panel more space when right panel is hidden
    if (showMiddlePanel && !showRightPanel && middlePanelRef.current) {
      setTimeout(() => {
        // Split space between left and middle panels when right is hidden
        leftPanelRef.current?.resize(50);
        middlePanelRef.current?.resize(50);
      }, 0);
    }

    // Balanced layout when all panels are visible
    if (showMiddlePanel && showRightPanel) {
      setTimeout(() => {
        leftPanelRef.current?.resize(30);
        middlePanelRef.current?.resize(40);
      }, 0);
    }
  }, [showMiddlePanel, showRightPanel]);

  return (
    <div className="h-full w-full px-1 relative overflow-hidden bg-background">
      <PanelGroup autoSaveId="doc-panels" direction="horizontal">
        {/* Left Panel - Always visible */}
        <Panel
          ref={leftPanelRef}
          collapsible={false} // Left panel is always visible
          defaultSize={showMiddlePanel || showRightPanel ? 30 : 100}
          id="left"
          maxSize={100}
          minSize={20}
          order={1}
          className="border-r border-border flex flex-col rounded-xl shadow-lg h-full overflow-hidden bg-card"
        >
          <LeftPanel />
        </Panel>

        {/* Middle Panel - Content panel (PDF/Notes) */}
        {showMiddlePanel && (
          <>
            <PanelResizeHandle className="bg-border cursor-col-resize z-10 hover:bg-primary/80 transition-colors" />
            <Panel
              ref={middlePanelRef}
              collapsible
              id="middle"
              defaultSize={showRightPanel ? 40 : 70}
              maxSize={100}
              minSize={25}
              order={2}
              className="border-r border-border flex flex-col rounded-xl shadow-lg h-full overflow-hidden bg-card"
            >
              <MiddlePanel />
            </Panel>
          </>
        )}

        {/* Right Panel - Chat assistant */}
        {showRightPanel && (
          <>
            <PanelResizeHandle className="bg-border cursor-col-resize z-10 hover:bg-primary/80 transition-colors" />
            <Panel
              collapsible
              defaultSize={30}
              id="right"
              maxSize={100}
              minSize={20}
              order={3}
              className="border-r border-border flex flex-col rounded-xl shadow-lg h-full bg-card"
            >
              <RightPanel />
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
};

export default DashboardPage;
