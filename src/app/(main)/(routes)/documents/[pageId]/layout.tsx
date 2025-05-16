import type { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { usePageStore } from '@/store/usePageStore'
import { useEffect } from 'react'
import GridLoader from '@/components/loader/grid-loader'
import { useTheme } from 'next-themes'
import { useStore } from '@/store/useCollectionStore'

const DashboardLayout = ({children}: {children: ReactNode}) => {
  const {pageId} = useParams()
  const {isPageLoading,setIsPageLoading, fetchPageData} = usePageStore()
  const {allItems} = useStore()
  const {resolvedTheme} = useTheme()

  useEffect(() => {
    if (!pageId) return; // Early return if no pageId

    setIsPageLoading(true);
    const page = allItems.find(item => item.id === pageId);
    if(!page){
      return
    }
    // Fetch the page data after setting the page details
    fetchPageData(page?.id as string, page?.type as 'pdf' | 'note');

    // Set loading state to false after data fetching
    setIsPageLoading(false);
  }, [pageId, allItems, fetchPageData, setIsPageLoading]);

  return (
    isPageLoading ? <div className="h-full w-full flex justify-center items-center">
    <GridLoader size="80" color={`${resolvedTheme==="light"?'#000000':'#ffffff'}`} />
  </div> : <div className="h-full w-full flex">
 {children}
</div>
  )

}

export default DashboardLayout