import React from 'react'
import { type Tab, usePanelStore } from '@/store/usePanelStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { File, FileText, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import Editor from '../blocknote/editor';
import { AnaraViewer } from '../anara/anara';

const LeftPanel = () => {
  const { activePageId, getLeftPanelTabs, removeTab } = usePanelStore();
  const tabs = getLeftPanelTabs();
  const mainTab = tabs.find(tab => tab.id === activePageId);
  const [activeTabId, setActiveTabId] = React.useState(mainTab?.id);

  if (tabs.length === 0) return null;

  return (
    <Tabs value={activeTabId} onValueChange={setActiveTabId} className="flex flex-col w-full h-full">
      <TabsList className="w-full p-0 bg-background justify-start border-b border-border rounded-none flex-shrink-0 h-8 overflow-hidden">
        <div className="flex flex-1 min-w-0 h-full overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative flex items-center group flex-shrink-0 h-full border-r border-gray-200 last:border-r-0 overflow-hidden">
              <TabsTrigger
                value={tab.id}
                className="flex items-center gap-1 px-3 h-full text-xs font-medium leading-none truncate max-w-[180px] rounded-none shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground data-[state=active]:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 border-b-2 border-transparent data-[state=active]:border-b-primary -mb-[2px] pr-6"
              >
                {tab.type === 'pdf' ? <FileText size={15} className="text-blue-500" /> : <File size={15} className="text-emerald-500" />}
                <span className="truncate">{tab.name}</span>
              </TabsTrigger>
              {tabs.length > 1 && tab.id !== activeTabId && (
                <button
                  type="button"
                  aria-label={`Close ${tab.name}`}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity cursor-pointer flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id, 'left');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <X size={11} className="text-gray-500" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center h-full flex-shrink-0 px-1">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Add tab"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </TabsList>
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab: Tab) => (
          <TabsContent key={tab.id} value={tab.id} className="flex flex-col mt-0 h-full overflow-auto">
            {tab.type === 'pdf' && tab.pdfUrl ? (
             <AnaraViewer pdfUrl={tab.pdfUrl} /> 
            ) : (
              <Editor />
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

export default LeftPanel