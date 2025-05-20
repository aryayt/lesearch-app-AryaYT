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

/**
 * Fetches and normalizes page data from Supabase
 * 
 * This function retrieves PDF or Note data from Supabase using the provided ID.
 * It includes comprehensive error handling for common database query issues:
 * 
 * 1. ID not found - When no records match the provided ID
 * 2. Duplicate IDs - When multiple records share the same ID (database integrity issue)
 * 3. Missing required fields - When critical fields like pdf_url are missing
 * 4. Database connection errors - When Supabase operations fail
 * 
 * TROUBLESHOOTING:
 * - If you see "not found" errors: Verify the ID exists in the database
 * - If you see "multiple found" errors: Check database for duplicate entries with same ID
 * - If you see empty error objects ({}): Check Supabase connection and permissions
 * 
 * @param pageId - The unique identifier of the PDF or Note to fetch
 * @param pageType - The type of resource to fetch ('pdf' or 'note')
 * @returns Promise<Tab> - Normalized tab data including all required fields
 * @throws Error with descriptive message when fetch fails
 */
async function fetchPageData(
  pageId: string,
  pageType: 'pdf' | 'note'
): Promise<Tab> {
  try {
    const supabase = createClient();
    
    if (pageType === 'pdf') {
      // First retrieve all matching records to better diagnose issues
      const { data: allMatches, error: matchError } = await supabase
        .from('pdfs')
        .select('id,name,pdf_url')
        .eq('id', pageId);
        
      if (matchError) {
        console.error('Supabase PDF query error:', matchError);
        throw new Error(`Database error while searching for PDF: ${matchError.message || 'Unknown error'}`);
      }
      
      // Handle the cases of no matches or multiple matches explicitly
      if (!allMatches || allMatches.length === 0) {
        console.error(`No PDF found with ID "${pageId}"`);
        throw new Error(`PDF with ID "${pageId}" not found. Verify the ID is correct and the PDF exists in the database.`);
      }
      
      if (allMatches.length > 1) {
        console.error(`Multiple PDFs (${allMatches.length}) found with the same ID "${pageId}"`);
        throw new Error(`Database integrity error: Multiple PDFs found with ID "${pageId}". Please contact the database administrator.`);
      }
      
      // If we get here, we have exactly one match
      const data = allMatches[0];
      
      if (!data.pdf_url) {
        throw new Error(`PDF URL is missing for PDF with ID "${pageId}"`);
      }
      
      return {
        id: data.id,
        name: data.name,
        type: 'pdf',
        pdfUrl: data.pdf_url,
      };
    }

    // First retrieve all matching records to better diagnose issues
    const { data: allMatches, error: matchError } = await supabase
      .from('notes')
      .select('id,name,content')
      .eq('id', pageId);
      
    if (matchError) {
      console.error('Supabase Note query error:', matchError);
      throw new Error(`Database error while searching for Note: ${matchError.message || 'Unknown error'}`);
    }
    
    // Handle the cases of no matches or multiple matches explicitly
    if (!allMatches || allMatches.length === 0) {
      console.error(`No Note found with ID "${pageId}"`);
      throw new Error(`Note with ID "${pageId}" not found. Verify the ID is correct and the note exists in the database.`);
    }
    
    if (allMatches.length > 1) {
      console.error(`Multiple Notes (${allMatches.length}) found with the same ID "${pageId}"`);
      throw new Error(`Database integrity error: Multiple Notes found with ID "${pageId}". Please contact the database administrator.`);
    }
    
    // If we get here, we have exactly one match
    const data = allMatches[0];
    
    return {
      id: data.id,
      name: data.name,
      type: 'note',
      content: data.content || '', // Ensure content is never undefined
    };
  } catch (err) {
    // Rethrow with more context if it's not already an Error object
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Error fetching ${pageType} with ID "${pageId}": ${String(err)}`);
  }
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
      // Default to only showing left panel, with middle and right panels hidden
      return get().panelVisibility[pageId] || { showMiddlePanel: false, showRightPanel: false };
    },

    /* Unified add/remove tab methods */
    addTab: async (pageId, pageType, panel) => {
      set({ isLoading: true, error: null });
      try {
        const activePageId = get().activePageId;
        if (!activePageId) {
          throw new Error('No active page selected. Please select a page before adding tabs.');
        }

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
        
        if (!pageId) {
          throw new Error('Invalid pageId: Page ID is required');
        }
        
        if (!pageType || !['pdf', 'note'].includes(pageType)) {
          throw new Error(`Invalid pageType: ${pageType}. Must be 'pdf' or 'note'`);
        }
        
        const tab = await fetchPageData(pageId, pageType);
        
        set((state) => {
          const updated = { ...existing };
          
          // Store current active tab IDs before updating
          const currentLeftActiveTabId = state.leftActiveTabId;
          const currentMiddleActiveTabId = state.middleActiveTabId;
          
          if (panel === 'left') {
            updated.leftPanelTabs = [...updated.leftPanelTabs, tab];
            // Set new tab as active in left panel
            setTimeout(() => get().setLeftActiveTabId(tab.id), 50);
          } else {
            updated.middlePanelTabs = [...updated.middlePanelTabs, tab];
            // Set new tab as active in middle panel
            setTimeout(() => get().setMiddleActiveTabId(tab.id), 50);
          }

          return {
            pageTabs: {
              ...state.pageTabs,
              [activePageId]: updated,
            },
            // Preserve existing active tab IDs to prevent panel selection issues
            leftActiveTabId: panel === 'left' ? tab.id : currentLeftActiveTabId,
            middleActiveTabId: panel === 'middle' ? tab.id : currentMiddleActiveTabId,
          };
        });
      } catch (err) {
        // Create a more descriptive error message
        const errorMessage = err instanceof Error 
          ? err.message 
          : (typeof err === 'object' && err !== null && Object.keys(err).length === 0 
              ? 'Unknown error occurred while adding tab. Please check your network connection and try again.' 
              : String(err));
              
        console.error('Error adding tab:', err, 'Message:', errorMessage);
        set({ error: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },

    removeTab: (tabId, panel) => {
      const activePageId = get().activePageId;
      if (!activePageId) return;
      
      // Store current active tab IDs before removing tabs
      const currentLeftActiveTabId = get().leftActiveTabId;
      const currentMiddleActiveTabId = get().middleActiveTabId;
      
      set((state) => {
        const existing = state.pageTabs[activePageId] || {
          leftPanelTabs: [],
          middlePanelTabs: [],
        };
        const updated = { ...existing };
        
        let newLeftActiveTabId = currentLeftActiveTabId;
        let newMiddleActiveTabId = currentMiddleActiveTabId;
        
        if (panel === 'left') {
          updated.leftPanelTabs = existing.leftPanelTabs.filter(
            (t) => t.id !== tabId
          );
          
          // If the removed tab was active, select another tab
          if (currentLeftActiveTabId === tabId && updated.leftPanelTabs.length > 0) {
            newLeftActiveTabId = updated.leftPanelTabs[0].id;
            // Use setTimeout to ensure state updates properly
            setTimeout(() => get().setLeftActiveTabId(newLeftActiveTabId), 50);
          }
        } else {
          updated.middlePanelTabs = existing.middlePanelTabs.filter(
            (t) => t.id !== tabId
          );
          
          // If the removed tab was active, select another tab
          if (currentMiddleActiveTabId === tabId && updated.middlePanelTabs.length > 0) {
            newMiddleActiveTabId = updated.middlePanelTabs[0].id;
            // Use setTimeout to ensure state updates properly
            setTimeout(() => get().setMiddleActiveTabId(newMiddleActiveTabId), 50);
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
          // Preserve existing active tab IDs to prevent panel selection issues
          leftActiveTabId: newLeftActiveTabId,
          middleActiveTabId: newMiddleActiveTabId,
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
  