import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useCollectionStore";
import { Undo2, FileText, FilePen, Folder, Trash2, Search } from "lucide-react";
import { SidebarMenuButton } from "../ui/sidebar";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { FileItem } from "@/store/useCollectionStore";

export function TrashBox() {
  const { deletedItems, fetchDeletedFilesAndFolders, restoreFromTrash, deleteItem } = useStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetchDeletedFilesAndFolders()
        .catch((error) => {
          console.error("Error fetching trash items:", error);
          toast.error("Failed to load trash items");
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, fetchDeletedFilesAndFolders]);

  const filtered = deletedItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="mr-2 text-blue-500" />;
      case "note":
        return <FilePen className="mr-2 text-green-500" />;
      case "folder":
        return <Folder className="mr-2 text-yellow-500" />;
      default:
        return null;
    }
  };

  const handleRestore = async (item: FileItem) => {
    try {
      await restoreFromTrash(item.id);
      toast.success(`${item.name} restored successfully`);
    } catch (error) {
      console.error("Error restoring item:", error);
      toast.error("Failed to restore item");
    }
  };

  const handleDelete = async (item: FileItem) => {
    try {
      await deleteItem(item.id, item.type);
      toast.success(`${item.name} deleted permanently`);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
          <Trash2 size={16} className="text-primary" />
          <span className="mt-1">Trash</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-96 min-w-[350px] max-w-[400px] h-96 p-0 rounded-lg shadow-xl flex flex-col"
        side="right"
        align="start"
        sideOffset={10}
        alignOffset={10}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-popover border-b px-4 pt-4 pb-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">Trash</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages in Trash"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 text-sm pl-8"
              autoFocus
            />
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-center">
              <Trash2 className="w-4 h-4 mr-2" />
              {search ? "No matching items found" : "No pages in Trash"}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-2 hover:bg-accent rounded-md transition-colors"
                >
                  <div className="flex items-center min-w-0">
                    {getIcon(item.type)}
                    <div className="truncate">
                      <button
                        type="button"
                        className="text-sm font-medium hover:underline truncate"
                        onClick={() => handleRestore(item)}
                      >
                        {item.name}
                      </button>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(item.updated_at || new Date()), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRestore(item)}
                      className="h-8 w-8"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-popover border-t px-4 py-2 text-xs text-muted-foreground text-center">
          Pages in Trash for over 30 days will be automatically deleted.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 