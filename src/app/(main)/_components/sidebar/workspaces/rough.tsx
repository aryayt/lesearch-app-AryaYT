import * as React from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileNode } from "@/app/(main)/_components/sidebar/workspaces/file-node";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";

export type Creation = {
  parentId: string | null;
  type: FileItem["type"];
  folderType?: FileItem["folderType"];
} | null;

export type FileItem = {
  id: string;
  name: string;
  parentId: string | null;
  type: "space" | "project" | "folder" | "file";
  folderType?: "chat" | "file" | "notes";
};

const initialFiles: FileItem[] = [
  // SPACES
  { id: "space-1", name: "Marketing", parentId: null, type: "space" },
  { id: "space-2", name: "Engineering", parentId: null, type: "space" },

  // PROJECTS under Marketing
  { id: "project-1", name: "Product Launch", parentId: "space-1", type: "project" },
  { id: "project-2", name: "Campaigns", parentId: "space-1", type: "project" },

  // PROJECTS under Engineering
  { id: "project-3", name: "AI Integration", parentId: "space-2", type: "project" },

  // Default folders under Product Launch
  { id: "project-1-chat", name: "Chat", parentId: "project-1", type: "folder", folderType: "chat" },
  { id: "project-1-file", name: "Files", parentId: "project-1", type: "folder", folderType: "file" },
  { id: "project-1-notes", name: "Notes", parentId: "project-1", type: "folder", folderType: "notes" },

  // Files inside Product Launch folders
  { id: "chat-1", name: "Team Discussion", parentId: "project-1-chat", type: "file" },
  { id: "file-1", name: "LaunchChecklist.pdf", parentId: "project-1-file", type: "file" },
  { id: "note-1", name: "Meeting Summary", parentId: "project-1-notes", type: "file" },

  // Default folders under Campaigns
  { id: "project-2-chat", name: "Chat", parentId: "project-2", type: "folder", folderType: "chat" },
  { id: "project-2-file", name: "Files", parentId: "project-2", type: "folder", folderType: "file" },
  { id: "project-2-notes", name: "Notes", parentId: "project-2", type: "folder", folderType: "notes" },

  // No files in Campaigns yet — empty folders

  // Default folders under AI Integration
  { id: "project-3-chat", name: "Chat", parentId: "project-3", type: "folder", folderType: "chat" },
  { id: "project-3-file", name: "Files", parentId: "project-3", type: "folder", folderType: "file" },
  { id: "project-3-notes", name: "Notes", parentId: "project-3", type: "folder", folderType: "notes" },

  // Files in AI Integration
  { id: "file-2", name: "Design Doc", parentId: "project-3-file", type: "file" },
  { id: "chat-2", name: "Slack Export", parentId: "project-3-chat", type: "file" },
  { id: "note-2", name: "Dev Sync Notes", parentId: "project-3-notes", type: "file" },
];

const initialCollectionItems: FileItem[] = [
  { id: "collection-1", name: "Budget Report", parentId: null, type: "file" },
  { id: "collection-2", name: "Marketing Plan", parentId: null, type: "file" },
  { id: "collection-3", name: "Client Proposals", parentId: null, type: "file" },
];

export function NavWorkspaces() {
  const [items, setItems] = React.useState<FileItem[]>(initialFiles);
  const [collectionItems, setCollectionItems] = React.useState<FileItem[]>(initialCollectionItems);
  const [draggedItem, setDraggedItem] = React.useState<FileItem | null>(null);
  const [dropTarget, setDropTarget] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState("");
  const [newCollectionItemName, setNewCollectionItemName] = React.useState("");
  const [creation, setCreation] = React.useState<Creation>(null);
  const [collectionCreation, setCollectionCreation] = React.useState<Creation>(null);

  const handleCreate = () => {
    if (!creation || !newName.trim()) return;
    const id = nanoid();
    setItems([
      ...items,
      { id, name: newName, parentId: creation.parentId, type: creation.type, folderType: creation.folderType },
    ]);
    setNewName("");
    setCreation(null);
  };

  const handleCreateCollectionItem = () => {
    if (!newCollectionItemName.trim()) return;
    const id = nanoid();
    setCollectionItems([
      ...collectionItems,
      { id, name: newCollectionItemName, parentId: null, type: "file" },
    ]);
    setNewCollectionItemName("");
  };

  const getFileHierarchy = (fileList: FileItem[]) => {
    const rootFiles = fileList.filter((file) => file.parentId === null);
    const getChildFiles = (parentId: string) => fileList.filter((file) => file.parentId === parentId);
    return { rootFiles, getChildFiles };
  };

  const { rootFiles, getChildFiles } = getFileHierarchy(items);

  const handleDragStart = (e: React.DragEvent, item: FileItem) => {
    e.stopPropagation();
    setDraggedItem(item);
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const isDescendant = (sourceId: string, targetId: string): boolean => {
    if (sourceId === targetId) return true;
    const findDesc = (id: string): string[] => {
      const children = items.filter((i) => i.parentId === id);
      return children.length === 0 ? [] : [...children.map((c) => c.id), ...children.flatMap((c) => findDesc(c.id))];
    };
    return findDesc(sourceId).includes(targetId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem || draggedItem.id === targetId) return;
    if (isDescendant(draggedItem.id, targetId)) {
      toast.error("Cannot move a file into its own child");
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === draggedItem.id ? { ...i, parentId: targetId } : i)));
    toast.success(`Moved "${draggedItem.name}" under "${items.find((i) => i.id === targetId)?.name}"`);
  };

  const handleRootDrop = (e: React.DragEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;
    setItems((prev) => prev.map((i) => (i.id === draggedItem.id ? { ...i, parentId: null } : i)));
    toast.success(`Moved "${draggedItem.name}" to root level`);
  };

  const handleRootDragOver = (e: React.DragEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div>
      {/* Workspaces Section */}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden select-none">
        <SidebarGroupLabel className="flex items-center justify-between">
          Workspaces
          <Button size="icon" variant="ghost" onClick={() => setCreation({ parentId: null, type: "space" })}>
            <PlusIcon />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <div className={cn("w-full min-h-[100px] p-2")} onDragOver={handleRootDragOver} onDrop={handleRootDrop}>
              {rootFiles.map((file) => (
                <FileNode
                  key={file.id}
                  file={file}
                  level={0}
                  childFiles={getChildFiles(file.id)}
                  getChildFiles={getChildFiles}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  draggedItem={draggedItem}
                  setDropTarget={setDropTarget}
                  dropTarget={dropTarget}
                  isDraggable={file.type === "folder" || file.type === "file"}
                  defaultOpen={false}
                  onRequestCreate={(newItem) => setCreation(newItem)}
                />
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <MoreHorizontal />
                  <span>More</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Dialog open={!!creation} onOpenChange={(open) => open || setCreation(null)}>
                <DialogContent>
                  <DialogTitle>
                    {creation
                      ? creation.type === "space"
                        ? "New Space"
                        : creation.type === "project"
                        ? "New Project"
                        : creation.type === "folder"
                        ? "New Folder"
                        : "New File"
                      : ""}
                  </DialogTitle>
                  <div className="space-y-4">
                    <Input placeholder="Enter title…" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    <Button onClick={handleCreate}>Create</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* My Collection Section */}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden select-none">
        <SidebarGroupLabel className="flex items-center justify-between">
          My Collection
          <Button size="icon" variant="ghost" onClick={() => setCollectionCreation({ parentId: null, type: "file" })}>
            <PlusIcon />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {collectionItems.map((collectionItem) => (
              <FileNode
                key={collectionItem.id}
                file={collectionItem}
                level={0}
                childFiles={[]}
                getChildFiles={() => []}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                draggedItem={draggedItem}
                setDropTarget={setDropTarget}
                dropTarget={dropTarget}
                isDraggable={true}
                defaultOpen={false}
                onRequestCreate={(newItem) => setCollectionCreation(newItem)}
              />
            ))}
            <Dialog open={!!collectionCreation} onOpenChange={(open) => open || setCollectionCreation(null)}>
              <DialogContent>
                <DialogTitle>New Collection Item</DialogTitle>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter title…"
                    value={newCollectionItemName}
                    onChange={(e) => setNewCollectionItemName(e.target.value)}
                  />
                  <Button onClick={handleCreateCollectionItem}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
