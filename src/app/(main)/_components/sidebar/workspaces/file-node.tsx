import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, FolderOpen, ChevronDown, ChevronRight, MoreHorizontal, Plus, Trash2, Star, ArrowUpRight, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import{ useStore, type CollectionItem } from "@/store/useCollectionStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

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
  onRequestCreate,
}: FileNodeProps) {
  const { openFolders, setOpenFolders, activeItemId, setActiveItem, deleteItem, isDeleting } = useStore();
  const isOpen = openFolders.has(file.id); 
  const isDragging = draggedItem?.id === file.id;
  const [hoverTimer, setHoverTimer] = React.useState<NodeJS.Timeout | null>(null); // Timer for hover
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  // const isDropTarget = dropTarget === file.id;
  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenFolders(file.id, !isOpen);
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
      setOpenFolders(file.id, true); // Open the folder after 1 second
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

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };


  React.useEffect(() => {
    const handleClick = () => {
      if (draggedItem || dropTarget || activeItemId) {
        onDragEnd();
        setDropTarget(null);
        setActiveItem(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [draggedItem, dropTarget, onDragEnd, setDropTarget, setActiveItem, activeItemId]);

  return (
    <>
      <SidebarMenuItem
        className={cn("transition-colors duration-100 cursor-grab", isDragging && " cursor-grabbing")}
        onDragOver={(e) => {
          e.preventDefault();
          // Only update the drop target if the dragged item is different and not the same as the current drop target
          if (draggedItem && draggedItem.id !== file.id && dropTarget !== file.id) {
            setDropTarget(file.id); // Update the drop target only if it's different from the current state
          }
        }}
        onDrop={handleDropHandler}
        onDragEnter={handleDragEnter} 
        onDragLeave={handleDragLeave}
      >
        <SidebarMenuButton
          asChild
          isActive={isDragging || activeItemId === file.id}
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
                <DropdownMenuItem onSelect={handleDelete}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {file.type !== "note" && file.type !== "chat" && file.type !== "pdf" && (
        <Collapsible open={isOpen} onOpenChange={() => setOpenFolders(file.id, !isOpen)}>
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
      {isDeleteDialogOpen && (
        <Dialog
          open={isDeleteDialogOpen}
          onOpenChange={() => setIsDeleteDialogOpen(false)}
        >
          <DialogContent>
            <DialogTitle>Delete {file.name}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {file.name}? This action cannot be undone.
            </DialogDescription>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={isDeleting} variant="destructive" onClick={() => deleteItem(file.id, file.type)}>Delete
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
