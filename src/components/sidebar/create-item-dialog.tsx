"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useCollectionStore";
import { usePanelStore } from "@/store/usePanelStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateItemDialog() {
  const [newName, setNewName] = useState("");
  const router = useRouter();
  
  const {
    creation,
    setCreation,
    createItem,
    createNote,
    setActiveItem,
    setOpenFolders,
    allItems,
  } = useStore();
  
  const { addTab, setLeftActiveTabId } = usePanelStore();

  // Update dialogContent when creation changes
  useEffect(() => {
    if (creation) {
      setNewName(""); // Reset name when dialog opens
    }
  }, [creation]);

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Wait for animation to complete before clearing dialog content
      setTimeout(() => {
        setCreation(null);
      }, 300); // Match this with your animation duration
    }
  };

  const handleCreate = async () => {
    if (!creation || !newName.trim()) return;

    const id = await createItem(newName, creation.parentId, creation.type);
    const data = await createNote(id, newName);

    if (id && data && !creation.parentId) {
      setActiveItem(id);
    }

    // After creating the item, expand the folder containing it
    const folder = allItems.find((item) => item.id === creation.parentId);
    if (folder) {
      setOpenFolders(folder.id, true);
    }

    if (creation.type === "folder") {
      toast.success(`Created new folder: "${newName}"`);
      setCreation(null); // Close dialog
      return;
    }

    toast.success(`Created new ${creation.type}: "${newName}"`);
    setCreation(null); // Close dialog
    router.push(`/documents/${id}`);
  };

  const handleCreateFromPanel = async () => {
    if (!creation || !newName.trim()) return;

    const id = await createItem(newName, creation.parentId, creation.type);
    const data = await createNote(id, newName);
    
    if (data) {
      await addTab(id as string, "note", creation.panel as "left" | "middle");
      setLeftActiveTabId(id as string);
    }

    toast.success(`Added new note: "${newName}"`);
    setCreation(null); // Close dialog
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (creation?.panel) {
      handleCreateFromPanel();
    } else {
      handleCreate();
    }
  };

  const getTitle = () => {
    if (!creation) return "";
    if (creation.parentId === null && creation.type === "folder") {
      return "Workspace";
    }
    return `${creation.type.charAt(0).toUpperCase()}${creation.type.slice(1).toLowerCase()}`;
  };

  if (!creation) return null;

  return (
    <Dialog open={!!creation} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogDescription>
          Create a new {creation.type}
        </DialogDescription>
        <DialogTitle>
          Create&nbsp;{getTitle()}
        </DialogTitle>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Enter title…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <Button type="submit">
            {creation.panel ? "Add Note" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 