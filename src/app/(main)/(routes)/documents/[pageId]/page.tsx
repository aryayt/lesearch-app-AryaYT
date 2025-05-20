"use client";
import { useEffect } from "react";
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

const DashboardPage = () => {
  const { activePageId, getPanelVisibility, setActivePageId } = usePanelStore();
  const params = useParams();
  const pageId = params?.pageId as string;
  const middlePanelRef = useRef<ImperativePanelHandle>(null);

  // Set the active page ID when the component mounts
  useEffect(() => {
    if (pageId) {
      setActivePageId(pageId);
    }
  }, [pageId, setActivePageId]);

  // Get the panel visibility state for this page
  const { showMiddlePanel, showRightPanel } = getPanelVisibility(pageId);

  // When right panel is hidden, resize middle panel to take up available space
  useEffect(() => {
    if (!showRightPanel && showMiddlePanel && middlePanelRef.current) {
      setTimeout(() => {
        middlePanelRef.current?.resize(100);
      }, 0);
    }
  }, [showRightPanel, showMiddlePanel]);

  return (
    <div className="h-full w-full px-1 relative overflow-hidden bg-background">
      <PanelGroup autoSaveId="doc-panels" direction="horizontal">
        <Panel
          collapsible
          defaultSize={20}
          id="left"
          maxSize={100}
          minSize={10}
          order={1}
          className="border-r border-border flex flex-col rounded-xl shadow-lg h-full overflow-hidden bg-card"
        >
          <LeftPanel />
        </Panel>
        {showMiddlePanel && (
          <>
            <PanelResizeHandle className="bg-border cursor-col-resize z-10 hover:bg-primary/80 transition-colors" />
            <Panel
              ref={middlePanelRef}
              collapsible
              id="middle"
              maxSize={100}
              minSize={25}
              order={2}
              className="border-r border-border flex flex-col rounded-xl shadow-lg h-full overflow-hidden bg-card"
            >
              <MiddlePanel />
            </Panel>
          </>
        )}
        {showRightPanel && (
          <>
            <PanelResizeHandle className="bg-border cursor-col-resize z-10 hover:bg-primary/80 transition-colors" />
            <Panel
              collapsible
              defaultSize={20}
              id="right"
              maxSize={100}
              minSize={10}
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
