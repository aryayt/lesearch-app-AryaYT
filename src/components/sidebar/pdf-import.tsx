"use client";

import { useState, useRef } from "react";
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

interface PDFImportProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PDFImport({ isOpen, onClose }: PDFImportProps) {
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createItem, deleteItem } = useStore();
  const { user } = useUserStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
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

      // Add the PDF name and id to the collection store

      // Close the dialog
      onClose();

      // Navigate to the PDF viewer
      // Using window.location.href instead of router.push to force a full page reload
      // This ensures the Zustand store is properly rehydrated from localStorage
      window.location.href = `/documents/${id}`;

      toast.success("PDF imported successfully");
    } catch (error) {
      console.error("Error importing PDF:", error);
      toast.error("Failed to import PDF");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import PDF</DialogTitle>
          <DialogDescription>
            Upload a PDF file to view and manage it in your documents.
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
                placeholder="Enter a name for the PDF"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
