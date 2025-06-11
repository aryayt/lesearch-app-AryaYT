"use client";
import { useEffect, memo } from "react";
import LeftPanel from "@/components/panels/left-panel";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import MiddlePanel from "@/components/panels/middle-panel";
import RightPanel from "@/components/panels/right-panel";
import { usePanelStore } from "@/store/usePanelStore";
import { useParams } from "next/navigation";

// Memoize panel components to prevent unnecessary re-renders
const MemoizedLeftPanel = memo(LeftPanel);
const MemoizedMiddlePanel = memo(MiddlePanel);
const MemoizedRightPanel = memo(RightPanel);

const DashboardPage = () => {
  const { getPanelVisibility, setActivePageId } = usePanelStore();
  const params = useParams();
  const pageId = params?.pageId as string;

  // Set the active page ID when the component mounts
  useEffect(() => {
    if (pageId) {
      setActivePageId(pageId);
    }
  }, [pageId, setActivePageId]);

  // Get the panel visibility state for this page
  const { showMiddlePanel, showRightPanel } = getPanelVisibility(pageId);

  return (
    <div className="h-full w-full px-1 relative overflow-hidden bg-background">
      <PanelGroup autoSaveId="doc-panels" direction="horizontal">
        {/* Left Panel - Always visible */}
        <Panel
          // collapsible={false}
          defaultSize={showMiddlePanel || showRightPanel ? 30 : 100}
          id="left"
          maxSize={100}
          minSize={25}
          order={1}
          className="border-r border-border flex flex-col rounded-xl shadow-lg h-full overflow-hidden bg-card"
        >
          <MemoizedLeftPanel />
        </Panel>

        {/* Middle Panel - Content panel (PDF/Notes) */}
        {showMiddlePanel && (
          <>
            <PanelResizeHandle className="bg-border cursor-col-resize z-10 hover:bg-primary/80 transition-colors" />
            <Panel
              // collapsible
              id="middle"
              defaultSize={showRightPanel ? 40 : 70}
              maxSize={100}
              minSize={25}
              order={2}
              className="border-r border-border flex flex-col rounded-xl shadow-lg h-full overflow-hidden bg-card"
            >
              <MemoizedMiddlePanel />
            </Panel>
          </>
        )}

        {/* Right Panel - Chat assistant */}
        {showRightPanel && (
          <>
            <PanelResizeHandle className="bg-border cursor-col-resize z-10 hover:bg-primary/80 transition-colors" />
            <Panel
              // collapsible
              defaultSize={30}
              id="right"
              maxSize={100}
              minSize={25}
              order={3}
              className="border-r border-border flex flex-col rounded-xl shadow-lg h-full bg-card"
            >
              <MemoizedRightPanel />
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
};

export default DashboardPage;
