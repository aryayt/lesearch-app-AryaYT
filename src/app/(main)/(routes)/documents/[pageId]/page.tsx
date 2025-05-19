"use client"
import LeftPanel from "@/components/panels/left-panel";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import MiddlePanel from "@/components/panels/middle-panel";
import RightPanel from "@/components/panels/right-panel";

const DashboardPage = () => {
  const initialVisibility = {
    showMiddlePanel: true,
    showRightPanel: true,
  };
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
        {initialVisibility.showMiddlePanel && (
          <>
            <PanelResizeHandle className="bg-border cursor-col-resize z-10 hover:bg-primary/80 transition-colors" />
            <Panel
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
        {initialVisibility.showRightPanel && (
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
  )
}

export default DashboardPage


