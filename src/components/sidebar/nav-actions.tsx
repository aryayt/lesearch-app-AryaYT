"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  FileText,
  FileX,
  GalleryVerticalEnd,
  LineChart,
  Link,
  MessageCircle,
  MessageCircleOff,
  MoreHorizontal,
  Settings2,
  Trash,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePanelStore } from "@/store/usePanelStore";
import { useParams } from "next/navigation";

const data = [
  {
    id: "customize",
    items: [
      {
        label: "Customize Page",
        icon: Settings2,
      },
      {
        label: "Turn into wiki",
        icon: FileText,
      },
    ],
  },
  {
    id: "manage",
    items: [
      {
        label: "Copy Link",
        icon: Link,
      },
      {
        label: "Duplicate",
        icon: Copy,
      },
      {
        label: "Move to",
        icon: CornerUpRight,
      },
      {
        label: "Move to Trash",
        icon: Trash2,
      },
    ],
  },
  {
    id: "history",
    items: [
      {
        label: "Undo",
        icon: CornerUpLeft,
      },
      {
        label: "View analytics",
        icon: LineChart,
      },
      {
        label: "Version History",
        icon: GalleryVerticalEnd,
      },
      {
        label: "Show delete pages",
        icon: Trash,
      },
      {
        label: "Notifications",
        icon: Bell,
      },
    ],
  },
  {
    id: "export",
    items: [
      {
        label: "Import",
        icon: ArrowUp,
      },
      {
        label: "Export",
        icon: ArrowDown,
      },
    ],
  },
];

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { activePageId, setPanelVisibility, getPanelVisibility } =
    usePanelStore();
  const params = useParams();

  // Use either the active page ID from the store, or the URL param as fallback
  const pageId = activePageId || (params?.pageId as string);
  const pagePanelVisibility = getPanelVisibility(pageId);

  const toggleMiddlePanel = () => {
    if (!pageId) return;

    setPanelVisibility(pageId, {
      showMiddlePanel: !pagePanelVisibility.showMiddlePanel,
      showRightPanel: pagePanelVisibility.showRightPanel,
    });
  };

  const toggleRightPanel = () => {
    if (!pageId) return;

    setPanelVisibility(pageId, {
      showMiddlePanel: pagePanelVisibility.showMiddlePanel,
      showRightPanel: !pagePanelVisibility.showRightPanel,
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Panel Toggles */}
      <Button
        title={
          pagePanelVisibility.showMiddlePanel
            ? "Close PDF Panel"
            : "Open PDF Panel"
        }
        aria-label="Toggle PDF Panel"
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={toggleMiddlePanel}
      >
        {pagePanelVisibility.showMiddlePanel ? <FileX /> : <FileText />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        title={
          pagePanelVisibility.showRightPanel
            ? "Close Chat Bot"
            : "Open Chat Bot"
        }
        aria-label="Toggle Chat Bot"
        onClick={toggleRightPanel}
      >
        {pagePanelVisibility.showRightPanel ? (
          // X icon for open state
          <MessageCircleOff />
        ) : (
          <MessageCircle />
        )}
      </Button>
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        Edit Oct 08
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 data-[state=open]:bg-accent"
          >
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0 z-[120]"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group) => (
                <SidebarGroup
                  key={group.id}
                  className="border-b last:border-none"
                >
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton>
                            <item.icon /> <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  );
}
