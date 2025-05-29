"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useStore } from "@/store/useCollectionStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemId: string;
  itemType: "note" | "pdf" | "folder";
}

export function DeleteItemDialog({
  isOpen,
  onClose,
  itemName,
  itemId,
  itemType,
}: DeleteItemDialogProps) {
  const { deleteItem, addToTrash } = useStore();
  const router = useRouter();
  const [permLoading, setPermLoading] = useState(false);
  const [trashLoading, setTrashLoading] = useState(false);

  const handleAddToTrash = async () => {
    setTrashLoading(true);
    try {
      const result = await addToTrash(itemId);
      if (result === "main") {
        router.push("/documents");
      }
      toast.success(`${itemName} moved to Trash`);
      onClose();
    } catch (error) {
      console.error("Error moving to trash:", error);
      toast.error("Error moving to trash");
    } finally {
      setTrashLoading(false);
    }
  };

  const handleDeletePermanently = async () => {
    setPermLoading(true);
    try {
      const result = await deleteItem(itemId, itemType);
      if (result === "main") {
        router.push("/documents");
      }
      toast.success(`${itemName} deleted permanently`);
      onClose();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item");
    } finally {
      setPermLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Delete {itemName}</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {itemName}?
          <br />
          <span className="text-sm text-muted-foreground">
            You can restore it from Trash later, or delete it permanently now.
          </span>
        </DialogDescription>
        {/* <div className="bg-destructive/10 border border-destructive/30 rounded p-2 my-2 text-xs text-destructive">
          <b>Warning:</b> Permanent delete cannot be undone and will remove this item forever.
        </div> */}
        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Less prominent permanent delete as link */}
          <Button
            variant="link"
            onClick={handleDeletePermanently}
            disabled={permLoading || trashLoading}
            className="text-destructive"
          >
            {permLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete Permanently"
            )}
          </Button>

          {/* Primary actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={trashLoading || permLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleAddToTrash}
              disabled={trashLoading || permLoading}
              className="font-semibold"
            >
              {trashLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}