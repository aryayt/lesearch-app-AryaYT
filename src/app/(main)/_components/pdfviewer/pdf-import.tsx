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
import {  useStore } from "@/store/useCollectionStore";

interface PDFImportProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PDFImport({ isOpen, onClose }: PDFImportProps) {
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createItem } = useStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!fileName.trim()) {
      toast.error("Please enter a name for the PDF");
      return;
    }

    try {
      setIsUploading(true);
      
      // Read the file as a base64 string
      const base64 = await readFileAsBase64(file);
      
      // Add the PDF name and id to the collection store
      createItem(fileName, null, "pdf");
      
      // Close the dialog
      onClose();
      
      // Navigate to the PDF viewer
      // Using window.location.href instead of router.push to force a full page reload
      // This ensures the Zustand store is properly rehydrated from localStorage
      // window.location.href = `/documents/123`;
      
      toast.success("PDF imported successfully");
    } catch (error) {
      console.error("Error importing PDF:", error);
      toast.error("Failed to import PDF");
    } finally {
      setIsUploading(false);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isUploading}>
            {isUploading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
