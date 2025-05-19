import React, { useEffect } from 'react'
import { type Tab, usePanelStore } from '@/store/usePanelStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FilePen, FileText, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import Editor from '../blocknote/editor';
import { AnaraViewer } from '../anara/anara';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useStore } from '@/store/useCollectionStore';

const MiddlePanel = () => {
  const { activePageId, getMiddlePanelTabs, removeTab, middleActiveTabId, setMiddleActiveTabId } = usePanelStore();
  const { setCreation } = useStore();
  const tabs = getMiddlePanelTabs();
 

  // Update activeTabId when activePageId changes
  useEffect(() => {
    const tab = tabs.find(tab => tab.id === activePageId);
    if (tab) {
      setMiddleActiveTabId(tab.id);
    }
  }, [activePageId, tabs, setMiddleActiveTabId]);

  const handleAddNote = () => {
    setCreation({ parentId: activePageId, type: "note", panel: 'middle' });
  }

  if (tabs.length === 0) return (
    <div className="flex flex-col w-full h-full items-center justify-center border-2 border-border">
        <p className="text-sm text-muted-foreground">There are no active tabs in this panel</p>
      <div className="flex flex-col items-center justify-center p-2">
        <Button variant="outline" size="sm" onClick={handleAddNote}>
          <Plus size={16} />
          Add Notes
        </Button>
      </div>
    </div>
  );

  return (
    <Tabs value={middleActiveTabId} onValueChange={setMiddleActiveTabId} defaultValue={middleActiveTabId as string} className="flex flex-col w-full h-full">
      <TabsList className="w-full p-0 bg-background justify-start border-b border-border rounded-none flex-shrink-0 h-8 overflow-hidden">
        <div className="flex flex-1 min-w-0 h-full overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative flex items-center group flex-shrink-0 h-full border-r border-gray-200 last:border-r-0 overflow-hidden">
              <TabsTrigger
                value={tab.id}
                className="flex items-center gap-1 px-3 h-full text-xs font-medium leading-none truncate max-w-[180px] rounded-none shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground data-[state=active]:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 border-b-2 border-transparent data-[state=active]:border-b-primary -mb-[2px] pr-6"
              >
                {tab.type === 'pdf' ? <FileText size={15}  /> : <FilePen size={15} />}
                <span className="truncate">{tab.name}</span>
              </TabsTrigger>
                <button
                  type="button"
                  aria-label={`Close ${tab.name}`}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity cursor-pointer flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id, 'middle');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <X size={11} className="text-gray-500" />
                </button>
            </div>
          ))}
        </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={handleAddNote}>
                <FileText size={16} />
                Add Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

export default MiddlePanel