import * as React from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileNode } from "@/components/sidebar/file-node";
import {
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type FileItem, useStore } from "@/store/useCollectionStore"; // Import Zustand store
import { usePanelStore } from "@/store/usePanelStore";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Add this component at the top level of the file
function FileNodeSkeleton({ level = 0, isCollection = false }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md",
        level > 0 && "ml-4"
      )}
    >
      <Skeleton className="h-4 w-4" /> {/* Icon skeleton */}
      <Skeleton className="h-4 w-32" /> {/* Name skeleton */}
      {isCollection && <Skeleton className="ml-auto h-4 w-4" />} {/* Collection indicator skeleton */}
    </div>
  );
}

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
    createNote,
    updateFile,
    fetchFilesAndFolders,
    setActiveItem,
    setOpenFolders,
  } = useStore();
  const { addTab, setLeftActiveTabId } = usePanelStore();
  const [newName, setNewName] = React.useState(""); // Declare newName and setNewName
  const [isWorkspacesLoading, setIsWorkspacesLoading] = React.useState(false);
  const [isCollectionsLoading, setIsCollectionsLoading] = React.useState(false);
  const [dialogContent, setDialogContent] = React.useState(creation);
  const router = useRouter();

  // Update dialogContent when creation changes
  React.useEffect(() => {
    if (creation) {
      setDialogContent(creation);
    }
  }, [creation]);

  // Handle dialog close
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Wait for animation to complete before clearing dialog content
      setTimeout(() => {
        setDialogContent(null);
      }, 300); // Match this with your animation duration
      setCreation(null);
    }
  };

  // Helper function to organize files into root (workspace) and child files
  const getFileHierarchy = React.useMemo(() => {
    return (fileList: FileItem[]) => {
      const rootWorkspaces = fileList.filter(
        (file) => file.parentId === null && file.type === "folder"
      );
      const rootCollections = fileList.filter(
        (file) => file.parentId === null && file.type !== "folder"
      );
      const getChildFiles = (parentId: string) =>
        fileList.filter((file) => file.parentId === parentId);
      return { rootWorkspaces, rootCollections, getChildFiles };
    };
  }, []); // Memoize the hierarchy function to prevent recomputation on every render

  const { rootWorkspaces, rootCollections, getChildFiles } =
    getFileHierarchy(allItems);

  // Fetch workspaces and collections data when the component mounts
  React.useEffect(() => {
    const loadData = async () => {
      setIsWorkspacesLoading(true);
      setIsCollectionsLoading(true);

      await fetchFilesAndFolders(); // Fetch files and folders from Supabase
      setIsWorkspacesLoading(false);
      setIsCollectionsLoading(false);
    };

    loadData();
  }, [fetchFilesAndFolders]); // Run this effect only once on mount

  React.useEffect(() => {
    const newItem = allItems.find(
      (item) => item.name === newName && item.parentId === creation?.parentId
    );
    if (newItem) {
      setActiveItem(newItem.id); // Set the newly created item as active after state update
    }
  }, [allItems, creation?.parentId, newName, setActiveItem]);

  // Drag start handler
  const handleDragStart = (e: React.DragEvent, item: FileItem) => {
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

  const handleDropHandler = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.id === targetId) return;

    try {
      const targetItem = allItems.find((item) => item.id === targetId);
      if (targetItem && ["pdf", "chat", "note"].includes(targetItem.type)) {
        toast.error("You cannot drop items onto a PDF, Chat, or Note.");
        return;
      }

      if (draggedItem.type === "folder") {
        if (targetId === null) {
          await updateFile(draggedItem.id, { parentId: targetId });
          toast.success(`Moved folder "${draggedItem.name}" to Workspace.`);
        } else {
          await updateFile(draggedItem.id, { parentId: targetId });
          toast.success(`Moved folder "${draggedItem.name}" into the folder.`);
        }
      }

      if (draggedItem.type === "note" || draggedItem.type === "pdf") {
        if (targetId !== null) {
          await updateFile(draggedItem.id, { parentId: targetId });
          toast.success(`Moved file "${draggedItem.name}" to the folder.`);
        } else {
          toast.error("Files cannot be dropped into the workspace directly.");
        }
      }
      setDropTarget(targetId);
      setOpenFolders(targetId, true);
    } catch (error) {
      console.error("Error handling drop:", error);
      toast.error("An error occurred while moving the item. Please try again.");
    }
  };

  // Handle item creation (creating files, folders, etc.)
  const handleCreate = async () => {
    if (!creation || !newName.trim()) return; // Ensure name is entered
    // Call createItem from Zustand store to create a new item
    const id = await createItem(newName, creation.parentId, creation.type);
    const data = await createNote(id, newName);
    if (id && data && !creation.parentId) {
      setActiveItem(id);
    }
    // Clear the input and reset the creation state
    setNewName("");
    setCreation(null);

    // After creating the item, expand the folder containing it
    const folder = allItems.find((item) => item.id === creation.parentId);
    if (folder) {
      setOpenFolders(folder.id, true); // Open the folder if a new item is created inside it
    }
    if (creation.type === "folder") {
      return;
    }
    // Show success toast
    toast.success(`Created new ${creation.type}: "${newName}"`);
    router.push(`/documents/${id}`);
    // window.location.href = `/documents/${id}`;
  };

  const handleCreateFromPanel = async () => {
    if (!creation || !newName.trim()) return; // Ensure name is entered
    // Call createItem from Zustand store to create a new item
    const id = await createItem(newName, creation.parentId, creation.type);
    const data = await createNote(id, newName);
    if (data) {
      await addTab(id as string, "note", creation.panel as "left" | "middle");
      setLeftActiveTabId(id as string);
    }

    // Clear the input and reset the creation state
    setNewName("");
    setCreation(null);
    // Show success toast
    toast.success(`Added new note: "${newName}"}`);
  };

  if(isWorkspacesLoading || isCollectionsLoading) {
    return (
      <div className="space-y-1">
        <FileNodeSkeleton />
        <FileNodeSkeleton />
        <FileNodeSkeleton level={1} />
        <FileNodeSkeleton level={1} />
        <FileNodeSkeleton />
      </div>
    )
  }

  return (
    <div>
      {/* Workspaces Section */}
      {rootWorkspaces.length > 0 && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className={cn("w-full p-2")}>
                  {rootWorkspaces.map((file) => (
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
                      isDraggable={
                        file.type !== "folder" && file.parentId !== null
                      }
                      onRequestCreate={(newItem) => setCreation(newItem)}
                    />
                  ))}
                
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* My Collection Section */}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>My Collection</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="w-full gap-0">
            <div className={cn("w-full p-2")}>
                  {rootCollections.length === 0 ? (
                <div className="text-muted-foreground text-sm px-2">
                  No files yet
                </div>
              ) : (
                rootCollections.map((collectionItem) => (
                  <FileNode
                    key={collectionItem.id}
                    file={collectionItem}
                    level={0}
                    childFiles={getChildFiles(collectionItem.id)}
                    getChildFiles={getChildFiles}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDropHandler}
                    draggedItem={draggedItem}
                    setDropTarget={setDropTarget}
                    dropTarget={dropTarget}
                    isDraggable={true}
                    onRequestCreate={(newItem) => setCreation(newItem)}
                    isCollection={true}
                  />
                ))
              )}
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Dialog for Creating Items */}
      <Dialog open={!!creation} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogTitle>
            Create&nbsp;
            {dialogContent?.parentId === null &&
            dialogContent?.type === "folder"
              ? "Workspace"
              : `${(dialogContent?.type || "").charAt(0).toUpperCase()}${(
                  dialogContent?.type || ""
                )
                  .slice(1)
                  .toLowerCase()}`}
          </DialogTitle>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (dialogContent?.panel) {
                handleCreateFromPanel();
              } else {
                handleCreate();
              }
            }}
          >
            <Input
              placeholder="Enter title…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            {dialogContent?.panel ? (
              <Button type="submit">Add Note</Button>
            ) : (
              <Button type="submit">Create</Button>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
