import {create} from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "./userStore";

// Define types for FileItems
export type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
  type: "space" | "project" | "folder" | "chats" | "pdfs" |"notes";
};

export type FileItem = {
  id: string;
  name: string;
  parentId: string | null;
  type: "chat" | "pdf" | "note";
  content_id?: string;
};

export type CollectionItem = {
  id: string;
  name: string;
  parentId: string | null;
  type: FolderItem["type"] | FileItem["type"];
  content_id?: string;
};

// Zustand Store for managing files, dragged item, drop target, etc.
type Store = {
  allItems: CollectionItem[]; // All files and folders
  draggedItem: CollectionItem | null; // Currently dragged item
  dropTarget: string | null; // Drop target item
  creation: { parentId: string | null; type: CollectionItem["type"]; } | null; // Creation dialog state
  openFolders: Set<string>; // Set of open folders
  activeItemId: string | null; // Track the active item by its ID
  isDeleting: boolean;

  setAllItems: (items: CollectionItem[]) => void;
  setDraggedItem: (item: CollectionItem | null) => void;
  setDropTarget: (targetId: string | null) => void;
  setCreation: (newCreation: { parentId: string | null; type: CollectionItem["type"]; } | null) => void;
  createItem: (name: string, parentId: string | null, type: CollectionItem["type"], content_id?: string) => void;
  handleDrop: (draggedItem: CollectionItem | null, targetId: string | null) => void;
  setOpenFolders: (folderId: string, open: boolean) => void;
  fetchFilesAndFolders: () => Promise<void>;
  addFile: (file: FileItem) => Promise<void>;
  addFolder: (folder: FolderItem) => Promise<void>;
  updateFile: (id: string, updates: Partial<FileItem>) => Promise<void>;
  updateFolder: (id: string, updates: Partial<FolderItem>) => Promise<void>;
  deleteItem: (id: string, type: CollectionItem["type"]) => Promise<void>;
  setActiveItem: (itemId: string | null) => void; // Method to set the active item
};




export const useStore = create<Store>((set, get) => ({
  allItems: [],
  draggedItem: null,
  dropTarget: null,
  creation: null,
  openFolders: new Set<string>(),
  activeItemId: null,
  isDeleting: false,
  setAllItems: (items) => set({ allItems: items }),
  setDraggedItem: (item) => set({ draggedItem: item }),
  setDropTarget: (targetId) => set({ dropTarget: targetId }),
  setCreation: (newCreation) => set({ creation: newCreation }),
  setActiveItem: (itemId) => set({ activeItemId: itemId }),


  deleteItem: async (id, type) => {
    const supabase = createClient();
    set({ isDeleting: true });
    if(type === "chat" || type === "pdf" || type === "note"){
      const { error } = await supabase.from("files").delete().eq("id", id);
      if (!error) {
        set((state) => ({
          allItems: state.allItems.filter((item) => item.id !== id),
        }));
      }
    }else{
      const { error } = await supabase.from("folders").delete().eq("id", id);
      console.log(error)
        if (!error) {
          set((state) => ({
            allItems: state.allItems.filter((item) => item.id !== id),
          }));
        }
        set({ isDeleting: false });
    }
  },

    // New method to set open folders
    setOpenFolders: (folderId, open) => set((state) => {
      const openFolders = new Set(state.openFolders);
      if (open) {
        openFolders.add(folderId);  // Add folder ID to open set
      } else {
        openFolders.delete(folderId);  // Remove folder ID from open set
      }
      return { openFolders };
    }),
  // Fetch files and folders from Supabase
  fetchFilesAndFolders: async () => {
    const supabase = createClient();
    
    // Fetch files and folders
    const { data: files, error: filesError } = await supabase.from("files").select("*");
    const { data: folders, error: foldersError } = await supabase.from("folders").select("*");
  
    // Handle errors
    if (filesError || foldersError) {
      console.log(filesError, foldersError);
      return;
    }

  
    // Filter and retain only the necessary fields (id, name, type)
    const cleanFiles = files?.map(({ id, name, type , parent_id, content_id }) => ({ id, name, type , parentId: parent_id, content_id })) || [];
    const cleanFolders = folders?.map(({ id, name, type , parent_id }) => ({ id, name, type , parentId: parent_id })) || [];
  
    // Combine files and folders and update the state
    set({
      allItems: [
        ...cleanFolders,
        ...cleanFiles,
      ],
    });
  },



  addFile: async (file) => {
    const supabase = createClient();
    console.log(file)
    const { data, error } = await supabase.from("files")
      .insert({
        name: file.name,
        parent_id: file.parentId,
        type: file.type,
        content_id: file.content_id,
        user_id: useUserStore.getState().user?.id,
      })
      .select();
      console.log(data, error)
  
    if (!error && data) {
      // Update the state with the newly created file
      set((state) => ({
        allItems: [...state.allItems, ...data], // Appending new file to state
      }));
  
    } else {
      console.error('Error inserting file:', error);
    }
  },
  

// Add a folder to Supabase
addFolder: async (folder) => {
  const supabase = createClient();
  const { data, error } = await supabase.from("folders")
    .insert({
      name: folder.name,
      parent_id: folder.parentId,
      type: folder.type,
      user_id: useUserStore.getState().user?.id,
    })
    .select();

  if (!error && data) {
    // Directly append the newly created folder to the allItems state
    set((state) => ({
      allItems: [...state.allItems, ...data], // This appends the newly created folder
    }));
  } else {
    console.error('Error inserting folder:', error);
  }
},


  // Update a file in Supabase
  updateFile: async (id, updates) => {
    const supabase = createClient();
    console.log("updateFile",id, updates);
    const { data, error } = await supabase.from("files")
    .update({
      parent_id: updates.parentId,
    })
    .eq("id", id)
    .select();
    console.log("updateFile",data, error);
    if (!error && data) {
      set((state) => ({
        allItems: state.allItems.map(item =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }));
    }
  },

  // Update a folder in Supabase
  updateFolder: async (id, updates) => {
    const supabase = createClient();
    console.log("updateFolder",id, updates);
    const { data, error } = await supabase.from("folders").update({
      parent_id: updates.parentId,
    }).eq("id", id).select();
    console.log("updateFolder",data, error);
    if (!error && data) {
      set((state) => ({
        allItems: state.allItems.map(item =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }));
    }
  },

  // Create item (decides file or folder by type)
  createItem: async (name, parentId, type, content_id) => {
    if (["note", "chat", "pdf"].includes(type)) {
      // File
      const file = {  name, parentId, type, content_id };
      await get().addFile(file as FileItem);
    } else {
      // Folder
      const folder = {  name, parentId, type };
      await get().addFolder(folder as FolderItem);
    }
    await get().fetchFilesAndFolders();
  },

  handleDrop: (draggedItem, targetId) => {
    if (!draggedItem || draggedItem.id === targetId) return;

    // Handle moving from My Collection to Workspaces or vice versa
    if (draggedItem.parentId === null && ["note", "chat", "pdf"].includes(draggedItem.type) && targetId) {
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
