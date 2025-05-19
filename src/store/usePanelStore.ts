import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { persist, createJSONStorage } from 'zustand/middleware';

// Unified Tab type for UI
export interface Tab {
  id: string;
  name: string;
  type: 'pdf' | 'note';
  pdfUrl?: string;
  content?: string;
}

// Shape of the panel store
interface PanelStore {
  /* State */
  activePageId: string | null;
  leftActiveTabId: string;
  middleActiveTabId: string;
  isLoading: boolean;
  error: string | null;
  pageTabs: Record<
    string,
    { leftPanelTabs: Tab[]; middlePanelTabs: Tab[] }
  >;

  /* State setters */
  setActivePageId: (pageId: string) => void;
  setLeftActiveTabId: (tabId: string) => void;
  setMiddleActiveTabId: (tabId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  /* Getters */
  getLeftPanelTabs: () => Tab[];
  getMiddlePanelTabs: () => Tab[];

  /* Side effects */
  addTab: (
    pageId: string,
    pageType: 'pdf' | 'note',
    panel: 'left' | 'middle'
  ) => Promise<void>;
  removeTab: (
    tabId: string,
    panel: 'left' | 'middle'
  ) => void;
}

// Fetch and normalize page data from Supabase
async function fetchPageData(
  pageId: string,
  pageType: 'pdf' | 'note'
): Promise<Tab> {
  const supabase = createClient();
  if (pageType === 'pdf') {
    const { data, error } = await supabase
      .from('pdfs')
      .select('id,name,pdf_url')
      .eq('id', pageId)
      .single();
    if (error || !data) throw error || new Error('PDF not found');
    return {
      id: data.id,
      name: data.name,
      type: 'pdf',
      pdfUrl: data.pdf_url,
    };
  }

  const { data, error } = await supabase
    .from('notes')
    .select('id,name,content')
    .eq('id', pageId)
    .single();
  if (error || !data) throw error || new Error('Note not found');
  return {
    id: data.id,
    name: data.name,
    type: 'note',
    content: data.content,
  };
}

type PersistedState = Pick<PanelStore, 'pageTabs' | 'activePageId' | 'leftActiveTabId'>;

export const usePanelStore = create(
  persist<PanelStore, [], [], PersistedState>(
    (set, get) => ({
    /* Initial State */
    activePageId: null,
    leftActiveTabId: "",
    middleActiveTabId: "",
    isLoading: false,
    error: null,
    pageTabs: {},

    /* State setters */
    setActivePageId: (pageId) => set({ activePageId: pageId }),
    setLeftActiveTabId: (tabId) => set({ leftActiveTabId: tabId }),
    setMiddleActiveTabId: (tabId) => set({ middleActiveTabId: tabId }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    /* Getters for current active page */
    getLeftPanelTabs: () => {
      const activeId = get().activePageId;
      if(!activeId) {
        return [];
      }
      const leftPanelTabs = get().pageTabs[activeId]?.leftPanelTabs ?? [];
      return leftPanelTabs;
    },
    getMiddlePanelTabs: () => {
      const pageId = get().activePageId;
      return pageId
        ? get().pageTabs[pageId]?.middlePanelTabs ?? []
        : [];
    },

    /* Unified add/remove tab methods */
    addTab: async (pageId, pageType, panel) => {
      set({ isLoading: true, error: null });
      try {
        const activePageId = get().activePageId;
        if (!activePageId) return;

        // Check if tab already exists in the specified panel
        const existing = get().pageTabs[activePageId] || {
          leftPanelTabs: [],
          middlePanelTabs: [],
        };
        
        const tabExists = panel === 'left' 
          ? existing.leftPanelTabs.some(tab => tab.id === pageId)
          : existing.middlePanelTabs.some(tab => tab.id === pageId);

        if (tabExists) {
          console.log("Tab already exists, skipping fetch");
          return;
        }

        console.log("Fetching new tab data-->", pageId, pageType, panel);
        const tab = await fetchPageData(pageId, pageType);
        
        set((state) => {
          const updated = { ...existing };
          if (panel === 'left') {
            updated.leftPanelTabs = [...updated.leftPanelTabs, tab];
          } else {
            updated.middlePanelTabs = [...updated.middlePanelTabs, tab];
            get().setMiddleActiveTabId(tab.id);
          }

          return {
            pageTabs: {
              ...state.pageTabs,
              [activePageId]: updated,
            },
          };
        });
      } catch (err) {
        console.error('Error adding tab:', err);
        set({ error: err instanceof Error ? err.message : String(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    removeTab: (tabId, panel) => {
      const activePageId = get().activePageId;
      if (!activePageId) return;
      set((state) => {
        const existing = state.pageTabs[activePageId] || {
          leftPanelTabs: [],
          middlePanelTabs: [],
        };
        const updated = { ...existing };
        if (panel === 'left') {
          updated.leftPanelTabs = existing.leftPanelTabs.filter(
            (t) => t.id !== tabId
          );
          if(get().leftActiveTabId === tabId) {
            get().setLeftActiveTabId(get().getLeftPanelTabs()[0].id);
          }
        } else {
          updated.middlePanelTabs = existing.middlePanelTabs.filter(
            (t) => t.id !== tabId
          );
          if(get().middleActiveTabId === tabId) {
            get().setMiddleActiveTabId(get().getMiddlePanelTabs()[0].id);
          }
        }
        return {
          pageTabs: {
            ...state.pageTabs,
            [activePageId]: updated,
          },
        };
      });
    },
  }),
  {
    name: 'panel-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      pageTabs: state.pageTabs,
      activePageId: state.activePageId,
      leftActiveTabId: state.leftActiveTabId,
    }),
  }
  )
);
  