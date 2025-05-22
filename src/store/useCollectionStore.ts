import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "./userStore";
import { usePanelStore } from "./usePanelStore";
export type FileItem = {
	id: string;
	name: string;
	parentId: string | null;
	type: "folder" | "pdf" | "note";
};

// Zustand Store for managing files, dragged item, drop target, etc.
type Store = {
	allItems: FileItem[]; // All files
	draggedItem: FileItem | null; // Currently dragged item
	dropTarget: string | null; // Drop target item
	creation: { parentId: string | null; type: FileItem["type"]; panel?: 'left' | 'middle' } | null; // Creation dialog state
	openFolders: Set<string>; // Set of open folders
	activeItemId: string | null; // Track the active item by its ID
	isDeleting: boolean;

	setAllItems: (items: FileItem[]) => void;
	setDraggedItem: (item: FileItem | null) => void;
	setDropTarget: (targetId: string | null) => void;
	setCreation: (
		newCreation: { parentId: string | null; type: FileItem["type"]; panel?: 'left' | 'middle' } | null,
	) => void;
	createItem: (
		name: string,
		parentId: string | null,
		type: FileItem["type"],
	) => Promise<string>;
	createNote: (id: string, name: string) => Promise<string>;
	handleDrop: (draggedItem: FileItem | null, targetId: string | null) => void;
	setOpenFolders: (folderId: string, open: boolean) => void;
	fetchFilesAndFolders: () => Promise<void>;
	addFile: (file: FileItem) => Promise<string>;
	updateFile: (id: string, updates: Partial<FileItem>) => Promise<void>;
	deleteItem: (id: string, type: FileItem["type"]) => Promise<string>;
	setActiveItem: (itemId: string | null) => void; // Method to set the active item
	moveToCollection: (id: string) => Promise<void>;
};

// Helper function to find all parent folders
const findParentFolders = (items: FileItem[], itemId: string | null): string[] => {
	if (!itemId) return [];
	
	const parentFolders: string[] = [];
	let currentItem = items.find(item => item.id === itemId);
	
	while (currentItem?.parentId) {
		parentFolders.push(currentItem.parentId);
		currentItem = items.find(item => item.id === currentItem?.parentId);
	}
	
	return parentFolders;
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
	setActiveItem: (itemId) => {
		// Find all parent folders
		const parentFolders = findParentFolders(get().allItems, itemId);
		
		// Open all parent folders
		for (const folderId of parentFolders) {
			get().setOpenFolders(folderId, true);
		}
		
		set({ activeItemId: itemId });
	},
	moveToCollection: async (id) => {
		const supabase = createClient();
		try {
			const { data, error } = await supabase
				.from("files")
				.update({ parent_id: null })
				.eq("id", id)
				.select();

			if (error) {
				throw error;
			}

			if (data?.[0]) {
				// Update the state with the modified item
				set((state) => {
					const updatedItems = state.allItems.map((item) =>
						item.id === id ? { ...item, parentId: null } : item
					);
					
					return {
						allItems: updatedItems,
						// Reset any active selections or states that might need updating
						draggedItem: null,
						dropTarget: null
					};
				});

				// Trigger a fetch to ensure we have the latest data
				await get().fetchFilesAndFolders();
			}
		} catch (error) {
			console.error("Error moving to collection:", error);
			throw error;
		}
	},

	createNote: async (id: string, name: string) => {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("notes")
			.insert({ id, name, user_id: useUserStore.getState().user?.id })
			.select()
			.single();
		if (error) {
			const {error: deleteError} = await supabase
			.from("files")
			.delete()
			.eq("id", id);
			if(deleteError) {
				console.log("Error deleting file:", deleteError);
			}
			return null;
		}
		return data;
	},

  deleteItem: async (id, type) => {
    const supabase = createClient();
	const {activePageId} = usePanelStore.getState();
    set({ isDeleting: true });
  
    try {
      // Step 1: Retrieve the file path from the database
      let filePath = null;
      if (type === "pdf") {
        const { data: filePathData, error: filePathError } = await supabase
          .from("pdfs")
          .select("file_path")
          .eq("id", id)
          .single(); // Use `.single()` for a single row query
  
        if (filePathError) {
          console.error("Error getting file path:", filePathError.message);
          throw new Error("Failed to fetch file path.");
        }
  
        filePath = filePathData?.file_path;
        console.log("File Path:", filePath);
      }
  
      // Step 2: Delete the file from Supabase Storage (if filePath exists)
      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from("documents")
          .remove([filePath]);
  
        if (deleteError) {
          console.error("Error deleting file from storage:", deleteError.message);
          throw new Error("Failed to delete file from storage.");
        }
        console.log("File deleted from storage:", filePath);
      }
  
      // Step 3: Delete the file record from the database
      const { error: deleteDbError } = await supabase
        .from("files")
        .delete()
        .eq("id", id);
  
      if (deleteDbError) {
        console.error("Error deleting file record from database:", deleteDbError.message);
        throw new Error("Failed to delete file record from database.");
      }
  
      // Step 4: Update the state to remove the item
      set((state) => ({
        allItems: state.allItems.filter((item) => item.id !== id),
      }));

	  if(activePageId === id){
		usePanelStore.getState().setActivePageId("");
		return "main";
	  }
      console.log("File and record successfully deleted.");
	  return id;
    } catch (err) {
      console.error("Error during file deletion process:", err);
	  throw new Error("Error during file deletion process.");
    } finally {
      // Step 5: Reset deleting state
      set({ isDeleting: false });
    }
  },

	// New method to set open folders
	setOpenFolders: (folderId, open) =>
		set((state) => {
			const openFolders = new Set(state.openFolders);
			if (open) {
				openFolders.add(folderId); // Add folder ID to open set
			} else {
				openFolders.delete(folderId); // Remove folder ID from open set
			}
			return { openFolders };
		}),
	// Fetch files and folders from Supabase
	fetchFilesAndFolders: async () => {
		const supabase = createClient();

		// Fetch files and folders
		const { data: files, error: filesError } = await supabase
			.from("files")
			.select("*");

		// Handle errors
		if (filesError) {
			console.log(filesError);
			return;
		}

		// Filter and retain only the necessary fields (id, name, type)
		const cleanFiles =
			files?.map(({ id, name, type, parent_id, content_id }) => ({
				id,
				name,
				type,
				parentId: parent_id,
				content_id,
			})) || [];

		// Combine files and folders and update the state
		set({
			allItems: [
				...cleanFiles,
			],
		});
	},

	addFile: async (file) => {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("files")
			.insert({
				name: file.name,
				parent_id: file.parentId,
				type: file.type,
				user_id: useUserStore.getState().user?.id,
			})
			.select();

		if (!error && data) {
			// Update the state with the newly created file
			set((state) => ({
				allItems: [...state.allItems, ...data], // Appending new file to state
			}));
			return data[0].id;
		}
		console.error("Error inserting file:", error);
	},

	// Update a file in Supabase
	updateFile: async (id, updates) => {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("files")
			.update({
				parent_id: updates.parentId,
			})
			.eq("id", id)
			.select();
		if (!error && data) {
			set((state) => ({
				allItems: state.allItems.map((item) =>
					item.id === id ? { ...item, ...updates } : item,
				),
			}));
		}
	},

	// Create item
	createItem: async (name, parentId, type) => {
		const item = { name, parentId, type };
		const id = await get().addFile(item as FileItem);
		
		// Instead of refetching all files, update the state directly
		if (id) {
			set((state) => ({
				allItems: [...state.allItems, {
					id,
					name,
					parentId,
					type
				}]
			}));
		}
		
		return id;
	},

	handleDrop: (draggedItem, targetId) => {
		if (!draggedItem || draggedItem.id === targetId) return;

		// Handle moving from My Collection to Workspaces or vice versa
		if (
			draggedItem.parentId === null &&
			["note", "pdf"].includes(draggedItem.type) &&
			targetId
		) {
			set((state) => ({
				allItems: [
					...state.allItems.filter((item) => item.id !== draggedItem.id),
					{ ...draggedItem, parentId: targetId },
				],
			}));
		} else if (draggedItem.parentId && targetId) {
			set((state) => ({
				allItems: state.allItems.map((i) =>
					i.id === draggedItem.id ? { ...i, parentId: targetId } : i,
				),
			}));
		} else {
			console.error("Invalid drop target.");
		}
	},
}));
