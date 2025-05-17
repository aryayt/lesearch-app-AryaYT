import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

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
  isLoading: boolean;
  error: string | null;
  pageTabs: Record<
    string,
    { leftPanelTabs: Tab[]; middlePanelTabs: Tab[] }
  >;

  /* State setters */
  setActivePageId: (pageId: string) => void;
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

export const usePanelStore = create<PanelStore>((set, get) => ({
  /* Initial State */
  activePageId: null,
  isLoading: false,
  error: null,
  pageTabs: {},

  /* State setters */
  setActivePageId: (pageId) => set({ activePageId: pageId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  /* Getters for current active page */
  getLeftPanelTabs: () => {
    const pageId = get().activePageId;
    return pageId
      ? get().pageTabs[pageId]?.leftPanelTabs ?? []
      : [];
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
      const tab = await fetchPageData(pageId, pageType);
      set((state) => {
        const existing = state.pageTabs[pageId] || {
          leftPanelTabs: [],
          middlePanelTabs: [],
        };
        const updated = { ...existing };
        if (panel === 'left') {
          updated.leftPanelTabs = [...updated.leftPanelTabs, tab];
        } else {
          updated.middlePanelTabs = [...updated.middlePanelTabs, tab];
        }
        return {
          pageTabs: {
            ...state.pageTabs,
            [pageId]: updated,
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
      } else {
        updated.middlePanelTabs = existing.middlePanelTabs.filter(
          (t) => t.id !== tabId
        );
      }
      return {
        pageTabs: {
          ...state.pageTabs,
          [activePageId]: updated,
        },
      };
    });
  },
}));
