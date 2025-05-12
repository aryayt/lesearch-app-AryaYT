import * as React from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileNode } from "@/app/(main)/_components/sidebar/workspaces/file-node";
import { SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarGroup } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type CollectionItem, useStore } from "@/store/useCollectionStore"; // Import Zustand store

export function NavWorkspaces() {
  // Accessing Zustand store state and actions
  const {
    allItems,
    draggedItem,
    dropTarget,
    creation,
    setDraggedItem,
    setDropTarget,
    setCreation,
    createItem,
    handleDrop,
  } = useStore();
  const [newName, setNewName] = React.useState(""); // Declare newName and setNewName
  // Helper function to organize files into root (workspace) and child files
  const getFileHierarchy = (fileList: CollectionItem[]) => {
    const rootFiles = fileList.filter((file) => file.parentId === "workspace");
    const getChildFiles = (parentId: string) => fileList.filter((file) => file.parentId === parentId);
    return { rootFiles, getChildFiles };
  };

  const { rootFiles, getChildFiles } = getFileHierarchy(allItems);

  // Drag start handler
  const handleDragStart = (e: React.DragEvent, item: CollectionItem) => {
    e.stopPropagation();
    setDraggedItem(item);
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  // Drag end handler
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  // Handle drop of an item
  const handleDropHandler = (e: React.DragEvent, targetId: string) => {
    handleDrop(draggedItem, targetId);
  };

  // Handle item creation (creating files, folders, etc.)
  const handleCreate = () => {
    if (!creation || !newName.trim()) return; // Ensure name is entered
  
    // Call createItem from Zustand store to create a new item
    createItem(newName, creation.parentId, creation.type);
    
    // Clear the input and reset the creation state
    setNewName(""); 
    setCreation(null);
  
    // Show success toast
    toast.success(`Created new ${creation.type}: "${newName}"`);
  };

  return (
    <div>
      {/* Workspaces Section */}
      <SidebarGroup>
        <SidebarGroupLabel>
          Workspaces
          <Button size="icon" variant="ghost" onClick={() => setCreation({ parentId: "workspace", type: "space" })}>
            <PlusIcon />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <div className={cn("w-full min-h-[100px] p-2")}>
              {rootFiles.map((file) => (
                <FileNode
                  key={file.id}
                  file={file}
                  level={0}
                  childFiles={getChildFiles(file.id)}
                  getChildFiles={getChildFiles}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDropHandler}
                  draggedItem={draggedItem}
                  setDropTarget={setDropTarget}
                  dropTarget={dropTarget}
                  isDraggable={file.type === "folder" || file.type === "pdf" || file.type === "note" || file.type === "chat"}
                  onRequestCreate={(newItem) => setCreation(newItem)}
                />
              ))}
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* My Collection Section */}
      <SidebarGroup>
        <SidebarGroupLabel>
          My Collection
          <Button size="icon" variant="ghost" onClick={() => setCreation({ parentId: "collection", type: "note" })}>
            <PlusIcon />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {allItems.filter((item) => item.parentId === "collection").map((collectionItem) => (
              <FileNode
                key={collectionItem.id}
                file={collectionItem}
                level={0}
                childFiles={[]}
                getChildFiles={() => []}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDropHandler}
                draggedItem={draggedItem}
                setDropTarget={setDropTarget}
                dropTarget={dropTarget}
                isDraggable={true}
                onRequestCreate={(newItem) => setCreation(newItem)}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Dialog for Creating Items */}
      <Dialog open={!!creation} onOpenChange={(open) => open || setCreation(null)}>
        <DialogContent>
          <DialogTitle>Create {creation?.type}</DialogTitle>
          <div className="space-y-4">
            <Input placeholder="Enter title…" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, FolderOpen, ChevronDown, ChevronRight, MoreHorizontal, Plus, Trash2, Star, ArrowUpRight } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type{ CollectionItem } from "@/store/useCollectionStore";

export type FileNodeProps = {
  file: CollectionItem;
  level: number;
  childFiles: CollectionItem[];
  getChildFiles: (parentId: string) => CollectionItem[];
  onDragStart: (e: React.DragEvent, item: CollectionItem) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  draggedItem: CollectionItem | null;
  setDropTarget: (id: string | null) => void;
  dropTarget: string | null;
  isDraggable?: boolean;
  defaultOpen?: boolean;
  onRequestCreate: (c: { parentId: string | null; type: CollectionItem["type"]; }) => void;
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
  const [hoverTimer, setHoverTimer] = React.useState<NodeJS.Timeout | null>(null); // Timer for hover

  // const isDropTarget = dropTarget === file.id;

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((o) => !o);
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, file);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  const handleDropHandler = (e: React.DragEvent) => {
    onDrop(e, file.id);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Start a timer to open the folder after 1 second
    if (hoverTimer) {
      clearTimeout(hoverTimer); // Clear any existing timer
    }

    const newTimer = setTimeout(() => {
      setIsOpen(true); // Open the folder after 1 second
    }, 300); // 300ms delay

    setHoverTimer(newTimer); // Save the timer to clear if needed
  };

  const handleDragLeave = () => {
    // If we leave the folder before 1 second, clear the timer
    if(dropTarget === file.id){
      setDropTarget(null)
    }
    
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }

    // Optionally, you can collapse the folder here if desired
    // setIsOpen(false);
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
        className={cn("transition-colors duration-100 cursor-grab", isDragging && " cursor-grabbing")}
        onDragOver={(e) => {
          e.preventDefault();
          if (file.type !== "note" && file.type !== "chat" && file.type !== "pdf" && draggedItem && draggedItem.id !== file.id) setDropTarget(file.id);
        }}
        onDrop={handleDropHandler}
        onDragEnter={handleDragEnter} 
        onDragLeave={handleDragLeave}
      >
        <SidebarMenuButton
          asChild
          isActive={isDragging}
          draggable={isDraggable}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            "flex items-center w-full py-1 px-2.5 rounded-md cursor-pointer",
            level > 0 && "ml-4",
            "hover:bg-muted/50",
          )}
        >
          <div className="relative flex items-center w-full">
            {file.type === "note" || file.type === "chat" || file.type === "pdf" ? <FileText /> : <FolderOpen />}
            {!["note", "chat", "pdf"].includes(file.type) && (
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
            {!["note", "chat", "pdf"].includes(file.type) ? <button
              type="button"
              className="ml-2 flex-1 truncate bg-transparent border-none p-0 text-left"
              onClick={toggleOpen}
            >
              {file.name}
            </button>:
            <Link 
              href={file.content_id ? `/documents/${file.content_id}` : ""}
              className="ml-2 flex-1 truncate bg-transparent border-none p-0 text-left"
            >
              {file.name}
            </Link>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-lg" side="right">
                <DropdownMenuItem>
                  <Star className="text-muted-foreground" />
                  <span>Add to Favorites</span>
                </DropdownMenuItem>
                {file.type === "space" && (
                  <DropdownMenuItem onSelect={() => onRequestCreate({ parentId: file.id, type: "project" })}>
                    <Plus /> New Project
                  </DropdownMenuItem>
                )}
                {file.type === "project" && (
                  <DropdownMenuItem onSelect={() => onRequestCreate({ parentId: file.id, type: "folder" })}>
                    <Plus /> New Folder
                  </DropdownMenuItem>
                )}
                {file.type === "folder" && (
                  <DropdownMenuItem onSelect={() => onRequestCreate({ parentId: file.id, type: "note" })}>
                    <Plus /> New File
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={file.id}>Copy Link</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowUpRight /> Open in New Tab
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {file.type !== "note" && file.type !== "chat" && file.type !== "pdf" && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div className="border-l border-border ml-4 pl-2">
              {childFiles.length > 0 ? (
                childFiles.map((child) => (
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
                ))
              ) : (
                <div className="ml-4 py-1 italic text-sm text-muted-foreground">No files inside</div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
}

