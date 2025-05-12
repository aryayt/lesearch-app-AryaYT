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
import { usePageStore } from "@/store/usePageStore";
import { useRouter } from "next/navigation";

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
  const {page, setIsPageLoading} = usePageStore();
  const isOpen = openFolders.has(file.id); 
  const isDragging = draggedItem?.id === file.id;
  const [hoverTimer, setHoverTimer] = React.useState<NodeJS.Timeout | null>(null); // Timer for hover
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  // const isDropTarget = dropTarget === file.id;
  const isActive = page.id === file.content_id; 

  const router = useRouter();

  const handleDragStart = React.useCallback((e: React.DragEvent) => {
    onDragStart(e, file);
  }, [onDragStart, file]);

  const handleDragEnd = React.useCallback(() => {
    onDragEnd();
  }, [onDragEnd]);

  const handleDropHandler = React.useCallback((e: React.DragEvent) => {
    onDrop(e, file.id);
  }, [onDrop, file.id]);

  const handleDelete = React.useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenFolders(file.id, !isOpen);
  };

  // Memoize file structure retrieval and file dragging logic
  const handleDragEnter = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }
    const newTimer = setTimeout(() => {
      setOpenFolders(file.id, true);
    }, 300);
    setHoverTimer(newTimer);
  }, [hoverTimer, setOpenFolders, file.id]);

  const handleDragLeave = React.useCallback(() => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    if (dropTarget === file.id) {
      setDropTarget(null);
    }
  }, [hoverTimer, dropTarget, setDropTarget, file.id]);

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

  const handleRoute = () => {
    setIsPageLoading(true)
    if (file.content_id) {
      router.push(`/documents/${file.content_id}`);
    }
  };

  return (
    <>
      <SidebarMenuItem
        className={cn("transition-colors duration-100 cursor-pointer", isDragging && " cursor-grabbing")}
        onDragOver={(e) => {
          e.preventDefault();
          // Only update the drop target if the dragged item is different and not the same as the current drop target
          if (draggedItem && draggedItem.id !== file.id && dropTarget !== file.id) {
            setDropTarget(file.id); // Update the drop target only if it's different from the current state
          }
        }}
        onClick={handleRoute}
        onDrop={handleDropHandler}
        onDragEnter={handleDragEnter} 
        onDragLeave={handleDragLeave}
      >
        <SidebarMenuButton
          asChild
          isActive={isActive}
          draggable={isDraggable}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            "flex items-center w-full py-1 px-2.5 rounded-md cursor-pointer",
            level > 0 && "ml-4",
            "hover:bg-muted/50",
            (isDragging || activeItemId === file.id) && "bg-primary/50 text-primary-foreground font-semibold"
          )}
        >
          <div className="relative flex items-center w-full">
            {file.type === "note" || file.type === "chat" || file.type === "pdf" ? <FileText /> : <FolderOpen />}
            {!["note", "chat", "pdf"].includes(file.type) && (
              <Button
                type="button"
                variant="ghost"
                aria-label="Toggle Folder"
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
             <button
              type="button"
              className="ml-2 flex-1 truncate bg-transparent border-none p-0 text-left cursor-pointer"
              onClick={file.content_id ? handleRoute : toggleOpen}
            >
              {file.name}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-lg" side="bottom" align="start" >
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
