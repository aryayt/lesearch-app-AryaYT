import { createClient } from "@/lib/supabase/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";
import { usePanelStore } from "./usePanelStore";

interface DocumentData {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_type: string;
  size: string;
  created_at: string;
}

interface NotesData {
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
  pageData: DocumentData | NotesData | null;
  setPageData: (pageData: DocumentData | NotesData) => void;
  setPage: (page: { id: string; type: string }) => void;
  setIsPageLoading: (isPageLoading: boolean) => void;
  fetchPageData: (pageId: string) => Promise<void>;
}

export const usePageStore = create<PageStore>()(
  persist(
    (set,get) => ({
      page: {
        id: "",
        type: "",
      },
      isPageLoading: false,
      pageData: null,
      setPageData: (pageData: DocumentData | NotesData) => set({ pageData }),
      fetchPageData: async (pageId: string) => {
        set({ isPageLoading: true });
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("id", pageId);
          if (error) throw error;

          const fetchedData = data[0];

          // Set the pageData and loading state
          set({ pageData: fetchedData as DocumentData, isPageLoading: false });

          // Now set the panel tabs based on the pageId
          if (fetchedData) {
            updatePanelTabs(pageId, fetchedData, get().page.type);
          }
        } catch (error) {
          console.error("Error fetching page data:", error);
          set({ isPageLoading: false });
        }
      },
      setPage: (page: { id: string; type: string }) => set({ page }),
      setIsPageLoading: (isPageLoading: boolean) => set({ isPageLoading }),
    }),
    {
      name: "page", // The key for localStorage persistence
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper function to update the panel tabs in the `usePanelStore`
const updatePanelTabs = (pageId: string, fetchedData: DocumentData | NotesData, pageType: string) => {
  const { setLeftPanelTabs } = usePanelStore.getState();

  const leftPanelTabs = [
    {
      id: fetchedData.id,
      title: fetchedData.name,
      type: pageType,
    },
  ];
  const { setPanelVisibility, panelTabs } = usePanelStore.getState();
  const currentPageData = panelTabs[pageId];

  if (!currentPageData) {
    setPanelVisibility(pageId, { showMiddlePanel: true, showRightPanel: true });
  }

  setLeftPanelTabs(pageId, leftPanelTabs, leftPanelTabs[0]?.id); // Set the left panel tabs for the page
};