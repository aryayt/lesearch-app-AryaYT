"use client"
import type { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { usePageStore } from '@/store/usePageStore'
import { useEffect } from 'react'
import GridLoader from '@/components/loader/grid-loader'
import { useTheme } from 'next-themes'
import { useStore } from '@/store/useCollectionStore'
import { usePanelStore } from '@/store/usePanelStore'

const DashboardLayout = ({children}: {children: ReactNode}) => {
  const {pageId} = useParams()
  const {isPageLoading,setIsPageLoading,setPage, fetchPageData} = usePageStore()
  const {setShowMiddlePanel,setShowRightPanel} = usePanelStore()
  const {allItems} = useStore()
  const {resolvedTheme} = useTheme()

  useEffect(() => {
    if (!pageId) return; // Early return if no pageId

    setIsPageLoading(true);
    const page = allItems.find(item => item.content_id === pageId);

    if (page) {
      // Optimized by updating states only when needed
      setPage({ id: pageId as string, type: page.type });
      setShowMiddlePanel(false);
      setShowRightPanel(false);
    }
    
    // Fetch the page data after setting the page details
    fetchPageData(pageId as string);

    // Set loading state to false after data fetching
    setIsPageLoading(false);
  }, [pageId, allItems, setPage, fetchPageData, setShowMiddlePanel, setShowRightPanel, setIsPageLoading]);

  return (
    isPageLoading ? <div className="h-full w-full flex justify-center items-center">
    <GridLoader size="80" color={`${resolvedTheme==="light"?'#000000':'#ffffff'}`} />
  </div> : children
  )
}

export default DashboardLayout