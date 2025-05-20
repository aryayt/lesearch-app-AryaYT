import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { persist, createJSONStorage } from 'zustand/middleware';
import type{ Annotation } from '@anaralabs/lector';

// Memory cache for large data
interface MemoryCache {
  content: Record<string, string>;
  pdfHighlights: Record<string, Annotation[]>;
}

// Panel visibility control
interface PanelVisibility {
  showMiddlePanel: boolean;
  showRightPanel: boolean;
}

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
  memoryCache: MemoryCache;
  panelVisibility: Record<string, PanelVisibility>;

  /* State setters */
  setActivePageId: (pageId: string) => void;
  setLeftActiveTabId: (tabId: string) => void;
  setMiddleActiveTabId: (tabId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setContent: (tabId: string, content: string) => void;
  setPdfHighlights: (tabId: string, highlights: Annotation[]) => void;
  setPanelVisibility: (pageId: string, visibility: PanelVisibility) => void;

  /* Getters */
  getLeftPanelTabs: () => Tab[];
  getMiddlePanelTabs: () => Tab[];
  getContent: (tabId: string) => string | undefined;
  getPdfHighlights: (tabId: string) => Annotation[] | undefined;
  getPanelVisibility: (pageId: string) => PanelVisibility;

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

type PersistedState = Pick<PanelStore, 'pageTabs' | 'activePageId' | 'leftActiveTabId' | 'panelVisibility'>;

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
    panelVisibility: {},
    memoryCache: {
      content: {},
      pdfHighlights: {},
    },

    /* State setters */
    setActivePageId: (pageId) => set({ activePageId: pageId }),
    setLeftActiveTabId: (tabId) => set({ leftActiveTabId: tabId }),
    setMiddleActiveTabId: (tabId) => set({ middleActiveTabId: tabId }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
    setContent: (tabId, content) =>
      set((state) => ({
        memoryCache: {
          ...state.memoryCache,
          content: {
            ...state.memoryCache.content,
            [tabId]: content,
          },
        },
      })),
    setPdfHighlights: (tabId, highlights) => 
      set((state) => ({
        memoryCache: {
          ...state.memoryCache,
          pdfHighlights: {
            ...state.memoryCache.pdfHighlights,
            [tabId]: highlights,
          },
        },
      })),
    setPanelVisibility: (pageId, visibility) =>
      set((state) => ({
        panelVisibility: {
          ...state.panelVisibility,
          [pageId]: visibility,
        },
      })),

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
    getContent: (tabId) => get().memoryCache.content[tabId],
    getPdfHighlights: (tabId) => get().memoryCache.pdfHighlights[tabId],
    getPanelVisibility: (pageId) => {
      return get().panelVisibility[pageId] || { showMiddlePanel: true, showRightPanel: true };
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
          if(panel === 'left') {
            get().setLeftActiveTabId(pageId);
          } else {
            get().setMiddleActiveTabId(pageId);
          }
          return;
        }

        console.log("Fetching new tab data-->", pageId, pageType, panel);
        const tab = await fetchPageData(pageId, pageType);
        
        
        set((state) => {
          const updated = { ...existing };
          if (panel === 'left') {
            updated.leftPanelTabs = [...updated.leftPanelTabs, tab];
            get().setLeftActiveTabId(tab.id);
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

        // Clear memory cache for removed tab
        const newMemoryCache = { ...state.memoryCache };
        delete newMemoryCache.content[tabId];
        delete newMemoryCache.pdfHighlights[tabId];

        return {
          pageTabs: {
            ...state.pageTabs,
            [activePageId]: updated,
          },
          memoryCache: newMemoryCache,
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
      panelVisibility: state.panelVisibility,
    }),
  }
  )
);
  