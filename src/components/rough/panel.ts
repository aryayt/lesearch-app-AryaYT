import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

// Define the Pdf and Note data types
interface PdfData {
  id: string;
  name: string;
  type: 'pdf';
  pdf_url: string;
}

interface NoteData {
  id: string;
  name: string;
  type: 'note';
  content: string;
}

// Define types for Tabs
export interface Tab {
  id: string;
  title: string;
  type: 'pdf' | 'note';
  pdfUrl?: string;
  content?: string;
  isLoading?: boolean;
  error?: string | null;
}

interface PanelStore {
  // Page and tab management
  activePageId: string | null;
  activeTabIds: Record<string, { leftPanelTabId: string | null; middlePanelTabId: string | null }>;
  pageTabs: Record<string, { leftPanelTabs: Tab[]; middlePanelTabs: Tab[] }>;
  isPageLoading: boolean;
  error: string | null;
  
  // Page actions
  setActivePageId: (pageId: string) => void;
  fetchPageData: (pageId: string, pageType: 'pdf' | 'note') => Promise<PdfData | NoteData | null>;
  setIsPageLoading: (loading: boolean) => void;
  
  // Tab actions
  getTabsForPage: (pageId: string) => { leftPanelTabs: Tab[]; middlePanelTabs: Tab[] };
  getActiveTabsForPage: (pageId: string) => { leftPanelTabId: string | null; middlePanelTabId: string | null };
  setTabsForPage: (pageId: string, tabs: { leftPanelTabs: Tab[]; middlePanelTabs: Tab[] }) => void;
  addTabForPage: (pageId: string, tab: Tab, panel: 'left' | 'middle') => void;
  removeTabForPage: (pageId: string, tabId: string, panel: 'left' | 'middle') => void;
  setActiveTabForPage: (pageId: string, tabId: string, panel?: 'left' | 'middle') => void;
}

// Helper function to fetch data based on type
const fetchPageByType = async (pageId: string, pageType: 'pdf' | 'note') => {
  const supabase = createClient();
  if (pageType === 'pdf') {
    const { data, error } = await supabase.from('pdfs').select('*').eq('id', pageId).single();
    if (data) {
      const pdfData: PdfData = {
        id: data.id,
        name: data.name,
        type: 'pdf',
        pdf_url: data.pdf_url,
      };
      return { data: pdfData, error };
    }
    return { data: null, error };
  }

  if (pageType === 'note') {
    const { data, error } = await supabase.from('notes').select('*').eq('id', pageId).single();
    if (data) {
      const noteData: NoteData = {
        id: data.id,
        name: data.name,
        type: 'note',
        content: data.content,
      };
      return { data: noteData, error };
    }
    return { data: null, error };
  }

  return { data: null, error: 'Invalid page type' };
};

export const usePanelStore = create<PanelStore>((set, get) => ({
  // Initial state
  activePageId: null,  // Initially no active page
  activeTabIds: {},    // Track active tab IDs for each page
  pageTabs: {},        // Store tabs for each page
  isPageLoading: false, // Initially, no page is loading
  error: null,         // Initially, no error
  
  // Set active page ID
  setActivePageId: (pageId) => set(() => ({ activePageId: pageId })),
  
  // Set page loading state
  setIsPageLoading: (loading) => set(() => ({ isPageLoading: loading })),
  
  // Fetch page data and update or create a tab for it
  fetchPageData: async (pageId, pageType) => {
    try {
      set(() => ({ isPageLoading: true, error: null }));
      
      // Fetch page data based on type (pdf or note)
      const { data, error } = await fetchPageByType(pageId, pageType);
      
      if (error) {
        console.error("Error fetching page data:", error);
        set(() => ({ error: error as string }));
        return null;
      } 
      
        console.log('Fetched page data from database:', pageId);
        
        // Create or update tab with the fetched data
        if (data) {
          const existingTabs = get().getTabsForPage(pageId);
          const activeTabIds = get().getActiveTabsForPage(pageId);
          
          // Check if we already have a tab for this data
          const existingTabIndex = existingTabs.leftPanelTabs.findIndex(tab => tab.id === data.id);
          
          if (existingTabIndex === -1) {
            // Create a new tab with the fetched data
            const newTab: Tab = {
              id: data.id,
              title: data.name,
              type: data.type,
              pdfUrl: data.type === 'pdf' ? data.pdf_url : undefined,
              content: data.type === 'note' ? data.content : undefined,
              isLoading: false,
              error: null
            };
            
            // Add the tab to the left panel by default
            get().addTabForPage(pageId, newTab, 'left');
            
            // Set this tab as active if no active tab exists
            if (!activeTabIds.leftPanelTabId) {
              get().setActiveTabForPage(pageId, newTab.id, 'left');
            }
          } 
            // Update the existing tab
            const updatedTabs = { ...existingTabs };
            updatedTabs.leftPanelTabs[existingTabIndex] = {
              ...updatedTabs.leftPanelTabs[existingTabIndex],
              title: data.name,
              pdfUrl: data.type === 'pdf' ? data.pdf_url : undefined,
              content: data.type === 'note' ? data.content : undefined,
              isLoading: false,
              error: null
            };
            
            get().setTabsForPage(pageId, updatedTabs);
          }
        
        
        return data;
      
    } catch (error) {
      console.error("Error fetching page data:", error);
      set(() => ({ error: error as string }));
      return null;
    } finally {
      set(() => ({ isPageLoading: false }));
    }
  },

  // Retrieve tabs for a specific pageId
  getTabsForPage: (pageId) => {
    const tabs = get().pageTabs[pageId] || { leftPanelTabs: [], middlePanelTabs: [] };
    return tabs;
  },
  
  // Get active tab IDs for a specific page
  getActiveTabsForPage: (pageId) => {
    return get().activeTabIds[pageId] || { leftPanelTabId: null, middlePanelTabId: null };
  },

  // Set the tabs for a specific pageId
  setTabsForPage: (pageId, tabs) => {
    set((state) => ({
      pageTabs: {
        ...state.pageTabs,
        [pageId]: tabs
      }
    }));
  },

  // Add a tab to either the left or middle panel for a specific pageId
  addTabForPage: (pageId, tab: Tab, panel) => {
    set((state) => {
      const pageTabs = state.pageTabs[pageId] || { leftPanelTabs: [], middlePanelTabs: [] };
      const updatedTabs = { ...pageTabs };

      if (panel === 'left') {
        updatedTabs.leftPanelTabs = [...updatedTabs.leftPanelTabs, tab];
      } else {
        updatedTabs.middlePanelTabs = [...updatedTabs.middlePanelTabs, tab];
      }

      return {
        pageTabs: {
          ...state.pageTabs,
          [pageId]: updatedTabs,
        },
      };
    });
  },

  // Remove a tab from either the left or middle panel for a specific pageId
  removeTabForPage: (pageId, tabId, panel) => {
    set((state) => {
      const pageTabs = state.pageTabs[pageId] || { leftPanelTabs: [], middlePanelTabs: [] };
      const updatedTabs = { ...pageTabs };

      if (panel === 'left') {
        updatedTabs.leftPanelTabs = updatedTabs.leftPanelTabs.filter((tab: Tab) => tab.id !== tabId);
      } else {
        updatedTabs.middlePanelTabs = updatedTabs.middlePanelTabs.filter((tab: Tab) => tab.id !== tabId);
      }

      return {
        pageTabs: {
          ...state.pageTabs,
          [pageId]: updatedTabs,
        },
      };
    });
  },

  // Set active tab for a specific pageId
  setActiveTabForPage: (pageId, tabId, panel = 'left') => {
    set((state) => {
      const currentActiveTabs = state.activeTabIds[pageId] || { leftPanelTabId: null, middlePanelTabId: null };
      
      return {
        activeTabIds: {
          ...state.activeTabIds,
          [pageId]: {
            ...currentActiveTabs,
            [panel === 'left' ? 'leftPanelTabId' : 'middlePanelTabId']: tabId
          }
        }
      };
    });
  },
}));
