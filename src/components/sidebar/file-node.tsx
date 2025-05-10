import * as React from "react";

import type { FileItem } from "./file-tree";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { Button } from "../ui/button";

export type FileNodeProps = {
  file: FileItem;
  level: number;
  childFiles: FileItem[];
  getChildFiles: (parentId: string) => FileItem[];
  onDragStart: (e: React.DragEvent, item: FileItem) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  draggedItem: FileItem | null;
  setDropTarget: (id: string | null) => void;
  dropTarget: string | null;
  isDraggable?: boolean;
  defaultOpen?: boolean;
  onRequestCreate: (c: { parentId: string | null; type: FileItem["type"]; folderType?: FileItem["folderType"] }) => void;
};

export function FileNode({
  file,
  level,
  childFiles,
  getChildFiles,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedItem,
  setDropTarget,
  dropTarget,
  isDraggable = false,
  defaultOpen = false,
  onRequestCreate,
}: FileNodeProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const isDragging = draggedItem?.id === file.id;
  const isDropTarget = dropTarget === file.id;
  const { isMobile } = useSidebar();

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(o => !o);
  };

  // drag handlers on the button wrapper
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, file);
  };
  const handleDragEnd = () => {
    onDragEnd();
  };

     React.useEffect(() => {
          const handleClick = () => {
              if (draggedItem || dropTarget) {
                  onDragEnd();
                  setDropTarget(null);
              }
          };
          document.addEventListener("click", handleClick);
          return () => document.removeEventListener("click", handleClick);
      }, [draggedItem, dropTarget, onDragEnd, setDropTarget]);

  return (
    <>
      <SidebarMenuItem
        className={cn("transition-colors duration-100 cursor-grab", isDragging && "opacity-50 cursor-grabbing")}
        onDragOver={e => {
          e.preventDefault();
          if (file.type !== "file" && draggedItem && draggedItem.id !== file.id) setDropTarget(file.id);
        }}
        onDrop={e => {
          e.preventDefault();
          if (file.type !== "file") onDrop(e, file.id);
        }}
        onDragLeave={() => dropTarget === file.id && setDropTarget(null)}
      >
        <SidebarMenuButton
          asChild
          draggable={isDraggable}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            "flex items-center w-full py-1 px-2.5 rounded-md cursor-pointer",
            level > 0 && "ml-4",
            isDropTarget ? "bg-primary/10" : "hover:bg-muted/50",
          )}
        >
          <div className="relative flex items-center w-full">
          {file.type === "file" ? <FileText /> : <FolderOpen />}
                        {file.type !== "file" && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "absolute left-0 flex items-center justify-center z-10 transition-opacity",
                                    "opacity-0 hover:opacity-100",
                                    "bg-sidebar-accent text-sidebar-accent-foreground rounded-full",
                                    "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 md:opacity-0"
                                )}
                                onClick={toggleOpen}
                            >
                                {isOpen ? <ChevronDown /> : <ChevronRight />}
                            </Button>
                        )}
            <span className="ml-2 flex-1 truncate" onClick={toggleOpen}>{file.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align={isMobile ? "end" : "start"}>
                <DropdownMenuItem>
                  <Star className="text-muted-foreground" />
                  <span>Add to Favorites</span>
                </DropdownMenuItem>
                {file.type === "space" && <DropdownMenuItem onSelect={() => onRequestCreate({ parentId: file.id, type: "project" })}><Plus /> New Project</DropdownMenuItem>}
                {file.type === "project" && <DropdownMenuItem onSelect={() => onRequestCreate({ parentId: file.id, type: "folder", folderType: "file" })}><Plus /> New Folder</DropdownMenuItem>}
                {file.type === "folder" && <DropdownMenuItem onSelect={() => onRequestCreate({ parentId: file.id, type: "file" })}><Plus /> New File</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem><Link href={file.id}>Copy Link</Link></DropdownMenuItem>
                <DropdownMenuItem><ArrowUpRight /> Open in New Tab</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Trash2 /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {file.type !== "file" && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div className="border-l border-border ml-4 pl-2">
              {childFiles.length > 0 ? childFiles.map(child => (
                <FileNode
                  key={child.id}
                  file={child}
                  level={level + 1}
                  childFiles={getChildFiles(child.id)}
                  getChildFiles={getChildFiles}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDrop={onDrop}
                  draggedItem={draggedItem}
                  setDropTarget={setDropTarget}
                  dropTarget={dropTarget}
                  isDraggable={child.type !== "space"}
                  onRequestCreate={onRequestCreate}
                />
              )) : (
                <div className="ml-4 py-1 italic text-sm text-muted-foreground">No files inside</div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
}
