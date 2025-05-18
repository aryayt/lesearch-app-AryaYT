"use client"
import type { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useStore } from '@/store/useCollectionStore'
import { usePanelStore } from '@/store/usePanelStore'


const DashboardLayout = ({children}: {children: ReactNode}) => {
  const {pageId} = useParams()
  const {allItems , setActiveItem} = useStore()
  const {setActivePageId, addTab, getLeftPanelTabs} = usePanelStore()
  

  useEffect(() => {
    if (!pageId) return; // Early return if no pageId

    const page = allItems.find(item => item.id === pageId);
    if (!page) {
      console.log('Page not found in allItems:', pageId);
      return;
    }
    setActiveItem(pageId as string);
    setActivePageId(pageId as string);
    console.log(getLeftPanelTabs())
    
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
    <div className="h-full w-full flex">
      {children}
    </div>
  )
}

export default DashboardLayout