// "use client"
// import type { ReactNode } from 'react'
// import { usePageStore } from '@/store/usePageStore'
// import GridLoader from '@/components/loader/grid-loader'
// import { useTheme } from 'next-themes'

// const DashboardLayout = ({children}: {children: ReactNode}) => {

//   const {isPageLoading} = usePageStore()
//   const {resolvedTheme} = useTheme()

//   return (
//     isPageLoading ? <div className="h-full w-full flex justify-center items-center">
//     <GridLoader size="80" color={`${resolvedTheme==="light"?'#000000':'#ffffff'}`} />
//   </div> : children
//   )
// }

// export default DashboardLayout

import type { ReactNode } from 'react'

const DashboardLayout = ({children}: {children: ReactNode}) => {
  return (
    <div>{children}</div>
  )
}

export default DashboardLayout