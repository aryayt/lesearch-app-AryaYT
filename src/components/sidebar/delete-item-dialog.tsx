"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useStore } from "@/store/useCollectionStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const { deleteItem, isDeleting } = useStore();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const result = await deleteItem(itemId, itemType);
      if (result === "main") {
        router.push("/documents");
      }
      toast.success(`${itemName} deleted successfully`);
      onClose();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Delete {itemName}</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {itemName}? This action cannot be
          undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
