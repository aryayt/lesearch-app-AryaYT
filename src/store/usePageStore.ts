import { createClient } from "@/lib/supabase/client";
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createJSONStorage } from "zustand/middleware"

interface DocumentData{
    id: string;
    user_id: string;
    name: string;
    file_path: string;
    file_type: string;
    size: string;
    created_at: string;
}

interface NotesData{
    id: string;
    name: string;
    content: string;
}


interface PageStore {
    page: {
        id: string;
        type: string;
    };
    isPageLoading: boolean;
    pageData: DocumentData | NotesData;
    setPageData: (pageData: DocumentData | NotesData) => void;
    setPage: (page: { id: string; type: string }) => void;
    setIsPageLoading: (isPageLoading: boolean) => void;
    fetchPageData: (pageId: string) => Promise<void>;
}

export const usePageStore = create<PageStore>()(
    persist(
      (set) => ({
    page: {
        id: "",
        type: ""
    },
    isPageLoading: false,
    pageData: {} as DocumentData | NotesData,
    setPageData: (pageData: DocumentData | NotesData) => set({ pageData }),
    fetchPageData: async(pageId: string) => {
        set({ isPageLoading: true })
        try {
            const supabase = createClient();
            const { data, error } = await supabase.from("documents").select("*").eq("id", pageId);
            if (error) throw error;
            set({ pageData: data[0], isPageLoading: false });
        } catch (error) {
            console.error(error);
            set({ isPageLoading: false });
        }
    },

    setPage: (page: { id: string; type: string }) => set({ page }),
    setIsPageLoading: (isPageLoading: boolean) => set({ isPageLoading }),
}), {
    name: "page",
    storage: createJSONStorage(() => localStorage),
}))
