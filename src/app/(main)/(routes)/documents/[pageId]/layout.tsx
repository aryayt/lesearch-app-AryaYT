"use client"
import type { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useStore } from '@/store/useCollectionStore'
import { usePanelStore } from '@/store/usePanelStore'
import { Loader2 } from 'lucide-react'


const DashboardLayout = ({children}: {children: ReactNode}) => {
  const {pageId} = useParams()
  const {allItems , setActiveItem} = useStore()
  const {setActivePageId, addTab, getLeftPanelTabs, getMiddlePanelTabs, setMiddleActiveTabId} = usePanelStore()
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pageId) return; // Early return if no pageId
    setLoading(true);
    const page = allItems.find(item => item.id === pageId);
    if (!page) {
      console.log('Page not found in allItems:', pageId);
      return;
    }
    setActiveItem(pageId as string);
    setActivePageId(pageId as string);
    
    // Define async function inside the effect
    async function loadPageData() {
      // Set active item in collection store to highlight it in the sidebar
      
      // Use optional chaining to safely access page properties
      if (page?.type) {
         await addTab(pageId as string, page.type as 'pdf' | 'note', 'left');
      } else {
        console.error('Page or page type is undefined');
      }
    }
    const existingTabs = getLeftPanelTabs();
    const existingMiddleTabs = getMiddlePanelTabs();
    // console.log(existingTabs, pageId);
    if(!existingTabs.find(tab => tab.id === pageId)) {
      loadPageData();
    }

    if(existingMiddleTabs.length > 0) {
      setMiddleActiveTabId(existingMiddleTabs[0].id);
    }
    setLoading(false);
    // Call the async function
  }, [pageId, allItems, setActiveItem, setActivePageId, addTab, getLeftPanelTabs, getMiddlePanelTabs, setMiddleActiveTabId]);

  return (
    <div className="h-full w-full flex">
      {loading ? <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div> : children}
    </div>
  )
}

export default DashboardLayout