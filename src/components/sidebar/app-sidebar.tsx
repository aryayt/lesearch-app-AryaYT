"use client"

import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavWorkspaces } from "./nav-workspaces"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import SidebarUser from "./sidebar-user"
import { useSidebarResize } from "../../hooks/useSidebarResize"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const {  handleRailMouseDown } = useSidebarResize();
  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader >
        <SidebarUser />
        <NavMain />
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto">
          <NavWorkspaces />
        </div>
        <div className="bg-sidebar sticky bottom-0">
          <NavSecondary />
        </div>
      </SidebarContent>
      <SidebarRail 
        onMouseDown={(e) => {
          handleRailMouseDown(e);
        }}
      />
    </Sidebar>
  )
}
