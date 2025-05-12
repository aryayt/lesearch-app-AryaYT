"use client"
import{ Panel, PanelGroup,PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels'
import { useRef} from 'react'
import MiddlePanel from '../_components/middle-panel'
import RightPanel from '../_components/right-panel'
import LeftPanel from '../_components/left-panel'
import { usePanelStore } from '@/store/usePanelStore'

const DashboardPage = () => {

  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const middlePanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const { showMiddlePanel, showRightPanel } = usePanelStore();

  return (
    <div className='h-full w-full px-1 relative overflow-hidden'>
       <PanelGroup
      autoSaveId="ImperativePanelApi"
      direction="horizontal"
      id="imperative-Panel-api"
    >
      <Panel
        collapsible
        defaultSize={20}
        id="left"
        maxSize={100}
        minSize={10}
        order={1}
        ref={leftPanelRef}
        className='border-r-2 border-gray-200 flex flex-col rounded-xl shadow-xl h-full overflow-hidden'
      >
        <LeftPanel />
      </Panel>
      {showMiddlePanel && <>
      <PanelResizeHandle className="w-1 bg-white cursor-col-resize z-10 hover:bg-blue-300 transition-colors duration-100 active:bg-blue-500" />
      <Panel
        collapsible={true}
        id="middle"
        maxSize={100}
        minSize={25}
        order={2}
        ref={middlePanelRef}
        className='border-r-2 border-gray-200 flex flex-col rounded-xl shadow-xl overflow-y-scroll h-full overflow-hidden'
      >
        <MiddlePanel />
      </Panel>
      </>}
      {showRightPanel && <>
      <PanelResizeHandle className="w-1 bg-white cursor-col-resize z-10 hover:bg-blue-300 transition-colors duration-100 active:bg-blue-500" />
      <Panel
        collapsible
        defaultSize={20}
        id="right"
        maxSize={100}
        minSize={10}
        order={3}
        ref={rightPanelRef}
        className='border-r border-gray-200 flex flex-col rounded-xl shadow-xl h-full overflow-hidden'
      >
        <RightPanel />
      </Panel>
      </>}
    </PanelGroup>
    </div>
  )
}

export default DashboardPage