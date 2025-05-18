"use client"
import type { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useStore } from '@/store/useCollectionStore'
import { usePanelStore } from '@/store/usePanelStore'
import { LoaderIcon } from 'lucide-react'


const DashboardLayout = ({children}: {children: ReactNode}) => {
  const {pageId} = useParams()
  const {allItems , setActiveItem} = useStore()
  const {isLoading, setActivePageId, addTab, getLeftPanelTabs} = usePanelStore()
  

  useEffect(() => {
    if (!pageId) return; // Early return if no pageId

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
    // console.log(existingTabs, pageId);
    if(!existingTabs.find(tab => tab.id === pageId)) {
      loadPageData();
    }
    // Call the async function
  }, [pageId, allItems, setActiveItem, setActivePageId, addTab, getLeftPanelTabs]);

  return (
    isLoading ? 
    <div className="h-full w-full flex items-center justify-center">
      <LoaderIcon className="h-6 w-6 animate-spin" />
    </div> : 
    <div className="h-full w-full flex">
      {children}
    </div>
  )
}

export default DashboardLayout