import React, { useEffect, useMemo, useState, useCallback } from 'react';

type TabType = 'pdf' | 'note';
interface Tab {
  id: string;
  title: string;
  type: TabType;
  pdfUrl?: string;
  content?: string;
}

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, File, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePanelStore } from '@/store/usePanelStore';
import { AnaraViewer } from '../anara/anara';
import Editor from '@/components/blocknote/editor';
import { useTheme } from 'next-themes'

const LeftPanel = () => {
  // Get panel store functions
  const {pageData} = usePageStore();
  
  // Local state for managing UI
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string>('tab-main');
  const {resolvedTheme} = useTheme()

  // Update active tab when page data changes
  useEffect(() => {
    if (pageData?.id) {
      // Set the pageId when the component mounts
      setActivePageId(pageData.id);
      
      // Get tabs for this page - they should already be initialized in the layout component
      const existingTabs = getTabsForPage(pageData.id).leftPanelTabs;
      
      if (existingTabs.length > 0) {
        // Get the active tab ID from the panel store
        const activeTabsInfo = usePanelStore.getState().getActiveTabsForPage(pageData.id);
        const currentActiveTabId = activeTabsInfo.leftPanelTabId;
        
        if (currentActiveTabId && existingTabs.some(tab => tab.id === currentActiveTabId)) {
          // If there's a valid active tab, use it
          setActiveTabId(currentActiveTabId);
        } else {
          // Otherwise try to use tab-main or the first available tab
          const mainTab = existingTabs.find(tab => tab.id === 'tab-main');
          if (mainTab) {
            setActiveTabId('tab-main');
            setActiveTabForPage(pageData.id, 'tab-main', 'left');
          } else if (existingTabs[0]) {
            setActiveTabId(existingTabs[0].id);
            setActiveTabForPage(pageData.id, existingTabs[0].id, 'left');
          }
        }
      } else {
        // This should rarely happen since tabs are initialized in the layout component
        // But as a fallback, create a main tab if needed
        console.log('No tabs found in LeftPanel, creating default tab');
        const initialTab: Tab = {
          id: 'tab-main',
          title: pageData.name || (pageData.type === 'pdf' ? 'Document.pdf' : 'Notes.md'),
          type: pageData.type as 'pdf' | 'note',
          pdfUrl: pageData.type === 'pdf' && 'pdf_url' in pageData ? pageData.pdf_url : undefined,
          content: pageData.type === 'note' && 'content' in pageData ? pageData.content : undefined
        };
        
        addTabForPage(pageData.id, initialTab, 'left');
        setActiveTabId('tab-main');
        setActiveTabForPage(pageData.id, 'tab-main', 'left');
      }
    }
  }, [pageData, getTabsForPage, addTabForPage, setActivePageId, setActiveTabForPage]);

  const tabs = useMemo(() => {
    return pageData?.id ? getTabsForPage(pageData.id).leftPanelTabs : [];
  }, [pageData?.id, getTabsForPage]);

  const addNewTab = (type: 'pdf' | 'note' = (pageData?.type as 'pdf' | 'note') || 'note') => {
    // Create a new tab with the appropriate properties based on type
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: type === 'pdf' ? `Document ${tabs.length + 1}.pdf` : `Notes ${tabs.length + 1}.md`,
      type,
      // For new tabs, we'll use placeholder content
      content: type === 'note' ? "Notes content here." : undefined,
      // For new PDF tabs, we'll use the current PDF URL if available
      pdfUrl: type === 'pdf' && pageData && 'pdf_url' in pageData ? pageData.pdf_url : undefined,
    };
    if (pageData?.id) {
      addTabForPage(pageData.id, newTab, 'left');
      setActiveTabForPage(pageData.id, newTab.id);
    }
    setPopoverOpen(false);
  };

  const removeTabHandler = (tabId: string) => {
    if (tabId === 'tab-main') return; // Prevent removal of the main tab
    if (pageData?.id) {
      removeTabForPage(pageData.id, tabId, 'left');
    }
  };


  // Get active tab ID from panel store
  const getActiveTabId = useCallback(() => {
    if (!pageData?.id) return 'tab-main';
    const activeTabsInfo = usePanelStore.getState().getActiveTabsForPage(pageData.id);
    return activeTabsInfo.leftPanelTabId || 'tab-main';
  }, [pageData?.id]);
  
  // Effect to sync local activeTabId with the one from panel store
  useEffect(() => {
    if (pageData?.id) {
      const currentActiveTabId = getActiveTabId();
      if (tabs.some(tab => tab.id === currentActiveTabId)) {
        setActiveTabId(currentActiveTabId);
      }
    }
  }, [pageData, tabs, getActiveTabId]);
  
  // Effect to ensure tab-main is always selected as default when returning to the page
  useEffect(() => {
    // This effect runs on component mount and when tabs change
    if (pageData?.id && tabs.length > 0) {
      const mainTab = tabs.find(tab => tab.id === 'tab-main');
      const currentTabExists = tabs.some(tab => tab.id === activeTabId);
      
      if (!currentTabExists) {
        // If current active tab doesn't exist anymore
        if (mainTab) {
          // Use tab-main if it exists
          setActiveTabId('tab-main');
          setActiveTabForPage(pageData.id, 'tab-main', 'left');
        } else if (tabs[0]) {
          // Otherwise use the first available tab
          setActiveTabId(tabs[0].id);
          setActiveTabForPage(pageData.id, tabs[0].id, 'left');
        }
      }
    }
  }, [tabs, pageData, activeTabId, setActiveTabForPage]);

  return (
    <Tabs 
      value={activeTabId} 
      defaultValue="tab-main" 
      onValueChange={(tabId) => {
        setActiveTabId(tabId);
        if (pageData?.id) {
          setActiveTabForPage(pageData.id, tabId, 'left');
        }
      }} 
      className="flex flex-col w-full h-full">
      <TabsList className="w-full p-0 bg-background justify-start border-b border-border rounded-none flex-shrink-0 h-8">
        <div className="flex flex-1 min-w-0 h-full overflow-x-auto no-scrollbar">
          {tabs.map((tab: Tab) => (
            <div key={tab.id} className="relative flex items-center group flex-shrink-0 h-full border-r border-gray-200 last:border-r-0">
              <TabsTrigger
                value={tab.id}
                className="flex items-center gap-1 px-3 h-full text-xs font-medium leading-none truncate max-w-[180px] rounded-none shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground data-[state=active]:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 border-b-2 border-transparent data-[state=active]:border-b-primary -mb-[2px] pr-6"
              >
                {tab.type === 'pdf' ? <FileText size={15} /> : <File size={15} />}
                <span className="truncate">{tab.title}</span>
              </TabsTrigger>
              {tabs.length > 1 && tab.id !== 'tab-main' && (
                <button
                  type="button"
                  aria-label={`Close ${tab.title}`}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity cursor-pointer flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTabHandler(tab.id);
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
              onClick={() => setPopoverOpen((v) => !v)}
              aria-label="Add tab"
            >
              <Plus size={16} />
            </Button>
            {popoverOpen && (
              <div className="absolute right-0 z-20 mt-1 w-32 rounded border bg-popover shadow-lg text-xs text-foreground py-1 animate-in fade-in min-w-32">
                <button
                  type="button"
                  className="hover:bg-accent px-3 py-1 cursor-pointer flex items-center gap-2 w-full text-left"
                  onClick={() => addNewTab('pdf')}
                >
                  <FileText size={15} /> PDF
                </button>
                <button
                  type="button"
                  className="hover:bg-accent px-3 py-1 cursor-pointer flex items-center gap-2 w-full text-left"
                  onClick={() => addNewTab('note')}
                >
                  <File size={15} /> Notes
                </button>
              </div>
            )}
          </div>
        </div>
      </TabsList>
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab: Tab) => (
          <TabsContent key={tab.id} value={tab.id} className="flex flex-col mt-0 h-full overflow-auto">
            {tab.type === 'pdf' ? (
              tab.pdfUrl ? <AnaraViewer pdfUrl={tab.pdfUrl || ""} /> : 
              <div className="h-full w-full flex justify-center items-center">
                <GridLoader size="80" color={`${resolvedTheme==="light"?'#000000':'#ffffff'}`} />
              </div>
            ) : (
              <Editor />
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default LeftPanel;
