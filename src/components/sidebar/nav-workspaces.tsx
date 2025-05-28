"use client";

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
import { type FileItem, useStore } from "@/store/useCollectionStore";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateItemDialog } from "./create-item-dialog";

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
  const {
    allItems,
    draggedItem,
    dropTarget,
    setDraggedItem,
    setDropTarget,
    setCreation,
    updateFile,
    fetchFilesAndFolders,
    setOpenFolders,
  } = useStore();
  const [isWorkspacesLoading, setIsWorkspacesLoading] = React.useState(false);
  const [isCollectionsLoading, setIsCollectionsLoading] = React.useState(false);

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
  
      if (draggedItem.type === "folder") {
        if (targetItem && (targetItem.type === "note" || targetItem.type === "pdf")) {
          toast.error("Folders cannot be dropped into a file.");
          return;
        }
  
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
                    isDraggable={file.parentId !== null}
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
      <CreateItemDialog />
    </div>
  );
}
