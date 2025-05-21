"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/store/useCollectionStore";
import { useUserStore } from "@/store/userStore";
import { usePanelStore } from "@/store/usePanelStore";

interface PDFImportProps {
  isOpen: boolean;
  onClose: () => void;
  targetPanel?: "left" | "middle"; // Which panel to add the PDF to
}

export function PDFImport({
  isOpen,
  onClose,
  targetPanel = "left",
}: PDFImportProps) {
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const importBtnRef = useRef<HTMLButtonElement>(null);
  const { createItem, deleteItem } = useStore();
  const { user } = useUserStore();
  const { activePageId, addTab } = usePanelStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(true);
      setFileName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension

      // Focus the name input field after file selection
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.select(); // Select the text for easy editing
        }
      }, 0);
    }
  };

  // Focus the import button when Enter is pressed in the name field
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && fileSelected && fileName.trim()) {
      e.preventDefault(); // Prevent form submission
      if (importBtnRef.current) {
        importBtnRef.current.focus();
      }
    }
  };

  const handleImport = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!fileName.trim()) {
      toast.error("Please enter a name for the PDF");
      return;
    }

    if (!user) {
      toast.error("User not found");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user?.id);

      const id = await createItem(fileName, null, "pdf");

      if (!id) {
        toast.error("Failed to create PDF");
        return;
      }

      formData.append("id", id);

      // Send to server-side API for processing
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        deleteItem(id, "pdf");
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload document");
      }

      // Close the dialog
      onClose();

      // Handle the import differently based on the target panel
      if (targetPanel === "middle" && activePageId) {
        // For middle panel, add the PDF as a tab without navigating
        toast.promise(addTab(id, "pdf", "middle"), {
          loading: "Adding PDF to middle panel...",
          success: "PDF added to middle panel",
          error: "Failed to add PDF to panel",
        });
      } else {
        // For left panel (default), navigate to the PDF viewer
        // This ensures the Zustand store is properly rehydrated from localStorage
        window.location.href = `/documents/${id}`;
        toast.success("PDF imported successfully");
      }
    } catch (error) {
      console.error("Error importing PDF:", error);
      toast.error("Failed to import PDF");
    } finally {
      setIsUploading(false);
    }
  };

  // Reset file selected state when dialog is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setFileSelected(false);
      setFileName("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {targetPanel === "middle"
              ? "Add PDF to Middle Panel"
              : "Import PDF"}
          </DialogTitle>
          <DialogDescription>
            {targetPanel === "middle"
              ? "Upload a PDF file to view in the middle panel alongside your current document."
              : "Upload a PDF file to view and manage it in your documents."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleImport}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pdf-file">PDF File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pdf-file"
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pdf-name">Name</Label>
              <Input
                id="pdf-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                placeholder="Enter a name for the PDF"
                ref={nameInputRef}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              ref={importBtnRef}
              className={
                fileSelected ? "ring-2 ring-primary ring-offset-2" : ""
              }
            >
              {isUploading ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
