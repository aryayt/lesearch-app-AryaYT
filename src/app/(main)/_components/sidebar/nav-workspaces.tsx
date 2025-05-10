import * as React from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileNode } from "@/app/(main)/_components/sidebar/workspaces/file-node";
import { SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarGroup } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type FileItem, useStore } from "@/store/useCollectionStore"; // Import Zustand store

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
  const getFileHierarchy = (fileList: FileItem[]) => {
    const rootFiles = fileList.filter((file) => file.parentId === "workspace");
    const getChildFiles = (parentId: string) => fileList.filter((file) => file.parentId === parentId);
    return { rootFiles, getChildFiles };
  };

  const { rootFiles, getChildFiles } = getFileHierarchy(allItems);

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

  // Handle drop of an item
  const handleDropHandler = (e: React.DragEvent, targetId: string) => {
    handleDrop(draggedItem, targetId);
  };

  // Handle item creation (creating files, folders, etc.)
  const handleCreate = () => {
    if (!creation || !newName.trim()) return; // Ensure name is entered
  
    // Call createItem from Zustand store to create a new item
    createItem(newName, creation.parentId, creation.type, creation.folderType);
    
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
                  isDraggable={file.type === "folder" || file.type === "file"}
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
          <Button size="icon" variant="ghost" onClick={() => setCreation({ parentId: "collection", type: "file" })}>
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
