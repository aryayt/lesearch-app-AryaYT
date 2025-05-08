"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Trash2, MessageCircleQuestion, Users, MessageSquare } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function NavSecondary({
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props} >
      <SidebarGroupContent>
        {/* Main items at top */}
        <SidebarMenu>
          <SidebarMenuItem title="Trash">
            <SidebarMenuButton asChild>
              <Link href="/trash" className="flex items-center gap-1">
              <Trash2 size={16} className="text-primary" />
              <span className="mt-1">Trash</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem title="Feedback">
            <SidebarMenuButton asChild>
              <Link href="/feedback" className="flex items-center gap-1">
              <MessageSquare size={16} className="text-primary" />
              <span className="mt-1">Feedback</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* Horizontal items at bottom */}
        <div className="mt-4 pt-2">
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Link href="/invite" className="flex flex-col items-center p-1 hover:text-foreground transition-colors" title="Invite and earn">
              <Users size={16} />
              <span>Invite and earn</span>
              </Link>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <Link href="/help" className="flex flex-col items-center p-1 hover:text-foreground transition-colors">
              <MessageCircleQuestion size={16} />
              <span className="mt-1">Help</span>
            </Link>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
