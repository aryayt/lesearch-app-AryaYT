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
    updateFile,
    updateFolder,
    fetchFilesAndFolders,
    setActiveItem,
    setOpenFolders,
  } = useStore();
  const [newName, setNewName] = React.useState(""); // Declare newName and setNewName
  const [isWorkspacesLoading, setIsWorkspacesLoading] = React.useState(false);
  const [isCollectionsLoading, setIsCollectionsLoading] = React.useState(false);

  // Helper function to organize files into root (workspace) and child files
  const getFileHierarchy = React.useMemo(() => {
    return (fileList: CollectionItem[]) => {
      const rootFiles = fileList.filter((file) => file.parentId === "workspace");
      const getChildFiles = (parentId: string) => fileList.filter((file) => file.parentId === parentId);
      return { rootFiles, getChildFiles };
    };
  }, []); // Memoize the hierarchy function to prevent recomputation on every render

  const { rootFiles, getChildFiles } = getFileHierarchy(allItems);

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
    const newItem = allItems.find((item) => item.name === newName && item.parentId === creation?.parentId);
    if (newItem) {
      setActiveItem(newItem.id); // Set the newly created item as active after state update
    }
  }, [allItems, creation?.parentId, newName, setActiveItem]);

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

  const handleDropHandler = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
  
    if (!draggedItem) return;
  
    // Check if the dragged item is the same as the target
    if (draggedItem.id === targetId) {
      return; // Avoid moving the item to itself
    }

    const targetItem = allItems.find((item) => item.id === targetId);

    // If the target item is of type "pdf", "chat", or "note", do not allow the drop
    if (targetItem && ["pdf", "chat", "note"].includes(targetItem.type)) {
      toast.error("You cannot drop items onto a PDF, Chat, or Note.");
      return;
    }
  
    // Check if the dragged item is a folder and is dropped inside a valid target folder
    if (draggedItem.type === "folder") {
      if (targetId === "workspace") {
        // Handle folder being moved to the workspace (root folder)
        handleDrop(draggedItem, targetId);
        await updateFolder(draggedItem.id, { parentId: targetId });
        toast.success(`Moved folder "${draggedItem.name}" to Workspace.`);
      } else if (targetId !== "workspace") {
        // Handle folder being moved into another folder
        handleDrop(draggedItem, targetId);
        await updateFolder(draggedItem.id, { parentId: targetId });
        toast.success(`Moved folder "${draggedItem.name}" into the folder.`);
      }
    }
  
    // Handle "project" type items (like folder)
    if (draggedItem.type === "project") {
      if (targetId === "workspace") {
        // Handle project being moved to the workspace (root folder)
        handleDrop(draggedItem, targetId);
        await updateFolder(draggedItem.id, { parentId: targetId });
        toast.success(`Moved project "${draggedItem.name}" to Workspace.`);
      } else if (targetId !== "workspace") {
        // Handle project being moved into another folder (or another project)
        handleDrop(draggedItem, targetId);
        await updateFolder(draggedItem.id, { parentId: targetId });
        toast.success(`Moved project "${draggedItem.name}" into the folder.`);
      }
    }
  
    // Check if the dragged item is a file and is dropped into a valid folder
    if (draggedItem.type === "note" || draggedItem.type === "pdf" || draggedItem.type === "chat") {
      if (targetId !== "workspace") {
        // Handle file being moved into a folder
        handleDrop(draggedItem, targetId);
        await updateFile(draggedItem.id, { parentId: targetId });
        toast.success(`Moved file "${draggedItem.name}" to the folder.`);
      } else {
        // If file is dropped in an invalid place, show an error
        toast.error("Files cannot be dropped into the workspace directly.");
      }
    }
  
    // Handle invalid drop target (if dragged item type doesn't match the target folder type)
    if (draggedItem.type !== "folder" && targetId === "workspace") {
      toast.error("You can't drop files directly into the workspace.");
    }
  };
  
  

  // Handle item creation (creating files, folders, etc.)
  const handleCreate = async () => {
    if (!creation || !newName.trim()) return; // Ensure name is entered
  
    // Call createItem from Zustand store to create a new item
    createItem(newName, creation.parentId, creation.type);
      // After creating the item, expand the folder containing it
  const folder = allItems.find(item => item.id === creation.parentId);
  if (folder) {
    setOpenFolders(folder.id, true);  // Open the folder if a new item is created inside it
  }
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
        <SidebarGroupLabel className="flex items-center justify-between">
          Workspaces
          <Button size="icon" variant="ghost" onClick={() => setCreation({ parentId: "workspace", type: "space" })}>
            <PlusIcon />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <div className={cn("w-full p-2")}>
              {/* If there are no workspaces */}
              {isWorkspacesLoading ? (
                <div className="text-muted-foreground text-sm px-2">Loading workspaces...</div>
              ) : rootFiles.length === 0 ? (
                <div className="text-muted-foreground text-sm px-2">No workspaces</div>
              ) : (
                rootFiles.map((file) => (
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
                    isDraggable={file.type!=="space"}
                    onRequestCreate={(newItem) => setCreation(newItem)}
                  />
                ))
              )}
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* My Collection Section */}
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-between">
          My Collection
          <Button size="icon" variant="ghost" onClick={() => setCreation({ parentId: "collection", type: "note" })}>
            <PlusIcon />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {/* If there are no collections */}
            {isCollectionsLoading ? (
              <div className="text-muted-foreground text-sm px-2">Loading collections...</div>
            ) : allItems.filter((item) => item.parentId === "collection").length === 0 ? (
              <div className="text-muted-foreground text-sm px-2">No collections</div>
            ) : (
              allItems.filter((item) => item.parentId === "collection").map((collectionItem) => (
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
              ))
            )}
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
