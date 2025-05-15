"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { usePageStore } from "@/store/usePageStore"
import { useStore } from "@/store/useCollectionStore"

export function RouteChangeListener() {
  const pathname = usePathname()
  const {setPage,fetchPageData,setIsPageLoading} = usePageStore()
  const {allItems} = useStore()

  useEffect(() => {
    setIsPageLoading(true)
    const match = pathname.match(/^\/documents\/([^/]+)/)
    if (!match) {
      setPage({id: "", type: ""})
      setIsPageLoading(false)
      return;
    }
    const page = allItems.find(item => item.content_id === match?.[1]);
    if (page) {
      setPage({id: page.content_id as string, type: page.type})
      fetchPageData(page.content_id as string)
    }
    else{
      setPage({id: "", type: ""})
    }
    setIsPageLoading(false)
  }, [pathname, setPage, allItems,fetchPageData,setIsPageLoading])

  return null
}

