// store/useStore.ts
import {create} from "zustand";
import { nanoid } from "nanoid";

// Define types for FileItems
export type FileItem = {
  id: string;
  name: string;
  parentId: string | null;
  type: "space" | "project" | "folder" | "file";
  folderType?: "chat" | "file" | "notes";
};

// Zustand Store for managing files, dragged item, drop target, etc.
type Store = {
  allItems: FileItem[]; // All files and folders
  draggedItem: FileItem | null; // Currently dragged item
  dropTarget: string | null; // Drop target item
  creation: { parentId: string | null; type: FileItem["type"]; folderType?: FileItem["folderType"] } | null; // Creation dialog state

  setAllItems: (items: FileItem[]) => void;
  setDraggedItem: (item: FileItem | null) => void;
  setDropTarget: (targetId: string | null) => void;
  setCreation: (newCreation: { parentId: string | null; type: FileItem["type"]; folderType?: FileItem["folderType"] } | null) => void;
  createItem: (name: string, parentId: string | null, type: FileItem["type"], folderType?: FileItem["folderType"]) => void;
  handleDrop: (draggedItem: FileItem | null, targetId: string | null) => void;
};

// Initial dummy data for files and collection items
const initialFiles: FileItem[] = [
    { id: "space-1", name: "Marketing", parentId: "workspace", type: "space" },
    { id: "space-2", name: "Engineering", parentId: "workspace", type: "space" },
    { id: "project-1", name: "Product Launch", parentId: "space-1", type: "project" },
    { id: "project-2", name: "Campaigns", parentId: "space-1", type: "project" },
    { id: "project-3", name: "AI Integration", parentId: "space-2", type: "project" },
    { id: "project-1-chat", name: "Chat", parentId: "project-1", type: "folder", folderType: "chat" },
    { id: "project-1-file", name: "Files", parentId: "project-1", type: "folder", folderType: "file" },
    { id: "project-1-notes", name: "Notes", parentId: "project-1", type: "folder", folderType: "notes" },
    { id: "chat-1", name: "Team Discussion", parentId: "project-1-chat", type: "file" },
    { id: "file-1", name: "LaunchChecklist.pdf", parentId: "project-1-file", type: "file" },
    { id: "note-1", name: "Meeting Summary", parentId: "project-1-notes", type: "file" },
  ];
  
  const initialCollectionItems: FileItem[] = [
    { id: "collection-1", name: "Budget Report", parentId: "collection", type: "file" },
    { id: "collection-2", name: "Marketing Plan", parentId: "collection", type: "file" },
    { id: "collection-3", name: "Client Proposals", parentId: "collection", type: "file" },
  ];

// Create Zustand store with state management logic
export const useStore = create<Store>((set) => ({
  allItems: initialFiles.concat(initialCollectionItems), // Initialize empty items array
  draggedItem: null,
  dropTarget: null,
  creation: null,

  setAllItems: (items) => set({ allItems: items }),
  setDraggedItem: (item) => set({ draggedItem: item }),
  setDropTarget: (targetId) => set({ dropTarget: targetId }),
  setCreation: (newCreation) => set({ creation: newCreation }),

  createItem: (name, parentId, type, folderType) => {
    const id = nanoid();
    const newItem = { id, name, parentId, type, folderType };
    set((state) => ({
      allItems: [...state.allItems, newItem],
    }));
  },

  handleDrop: (draggedItem, targetId) => {
    if (!draggedItem || draggedItem.id === targetId) return;

    // Handle moving from My Collection to Workspaces or vice versa
    if (draggedItem.parentId === "collection" && targetId) {
      set((state) => ({
        allItems: [
          ...state.allItems.filter((item) => item.id !== draggedItem.id),
          { ...draggedItem, parentId: targetId },
        ],
      }));
    } else if (draggedItem.parentId && targetId) {
      set((state) => ({
        allItems: state.allItems.map((i) =>
          i.id === draggedItem.id ? { ...i, parentId: targetId } : i
        ),
      }));
    } else {
      console.error("Invalid drop target.");
    }
  },
}));
