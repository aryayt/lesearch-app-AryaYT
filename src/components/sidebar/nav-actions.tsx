"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Columns3,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  FileText,
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
import { useLayoutStore } from "@/store/layoutStore";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const { activePageId, setPanelVisibility, getPanelVisibility } = usePanelStore();
  const { showExternalLink, setShowExternalLink } = useLayoutStore();
  const params = useParams();

  // Use either the active page ID from the store, or the URL param as fallback
  const pageId = activePageId || (params?.pageId as string);
  const pagePanelVisibility = getPanelVisibility(pageId);

  // Toggle functions for each panel
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
      {/* External Link Toggle */}
      {!showExternalLink && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 transition-colors"
          title="Show External Link"
          aria-label="Show External Link"
          onClick={() => setShowExternalLink(true)}
        >
          <Link className="text-muted-foreground" size={18} />
        </Button>
      )}

      {/* Middle Panel Toggle with Columns3 icon */}
      <Button
        variant={pagePanelVisibility.showMiddlePanel ? "default" : "ghost"}
        size="icon"
        className={cn(
          "size-7 transition-colors",
          pagePanelVisibility.showMiddlePanel &&
            "bg-primary/20 hover:bg-primary/30"
        )}
        title={
          pagePanelVisibility.showMiddlePanel
            ? "Close Middle Panel"
            : "Open Middle Panel"
        }
        aria-label="Toggle Middle Panel"
        onClick={toggleMiddlePanel}
      >
        <Columns3
          className={
            pagePanelVisibility.showMiddlePanel
              ? "text-primary"
              : "text-muted-foreground"
          }
          size={18}
        />
      </Button>

      {/* Chat Panel Toggle */}
      <Button
        variant={pagePanelVisibility.showRightPanel ? "default" : "ghost"}
        size="icon"
        className={cn(
          "size-7 transition-colors",
          pagePanelVisibility.showRightPanel &&
            "bg-primary/20 hover:bg-primary/30"
        )}
        title={
          pagePanelVisibility.showRightPanel
            ? "Close Chat Bot"
            : "Open Chat Bot"
        }
        aria-label="Toggle Chat Bot"
        onClick={toggleRightPanel}
      >
        {pagePanelVisibility.showRightPanel ? (
          <MessageCircleOff className="text-primary" />
        ) : (
          <MessageCircle className="text-muted-foreground" />
        )}
      </Button>

      <Popover>
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
