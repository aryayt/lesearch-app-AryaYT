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
  const {isLoading, setActivePageId, addTab} = usePanelStore()
  

  useEffect(() => {
    if (!pageId) return; // Early return if no pageId

    // Find the page in allItems
    console.log(allItems);
    const page = allItems.find(item => item.id === pageId);
    if (!page) {
      console.log('Page not found in allItems:', pageId);
      return;
    }
    
    // Define async function inside the effect
    async function loadPageData() {
      // Set active item in collection store to highlight it in the sidebar
      setActiveItem(pageId as string);
      setActivePageId(pageId as string);
      
      // Use optional chaining to safely access page properties
      if (page?.type) {
         await addTab(pageId as string, page.type as 'pdf' | 'note', 'left');
      } else {
        console.error('Page or page type is undefined');
      }
    }
    // Call the async function
    loadPageData();
  }, [pageId, allItems, setActiveItem, setActivePageId, addTab]);

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