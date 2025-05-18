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
    <div className="h-full w-full px-1 relative overflow-hidden">
      <PanelGroup autoSaveId="doc-panels" direction="horizontal">
        <Panel
          collapsible
          defaultSize={20}
          id="left"
          maxSize={100}
          minSize={10}
          order={1}
          className="border-r-2 border-gray-200 flex flex-col rounded-xl shadow-xl h-full overflow-hidden"
        >
          <LeftPanel />
        </Panel>
        {initialVisibility.showMiddlePanel && (
          <>
            <PanelResizeHandle className="w-1 bg-white cursor-col-resize z-10 hover:bg-blue-300" />
            <Panel
              collapsible
              id="middle"
              maxSize={100}
              minSize={25}
              order={2}
              className="border-r-2 border-gray-200 flex flex-col rounded-xl shadow-xl overflow-y-scroll h-full"
            >
              <MiddlePanel />
            </Panel>
          </>
        )}
        {initialVisibility.showRightPanel && (
          <>
            <PanelResizeHandle className="w-1 bg-white cursor-col-resize z-10 hover:bg-blue-300" />
            <Panel
              collapsible
              defaultSize={20}
              id="right"
              maxSize={100}
              minSize={10}
              order={3}
              className="border-r border-gray-200 flex flex-col rounded-xl shadow-xl h-full"
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


