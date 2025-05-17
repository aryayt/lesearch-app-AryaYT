import { create } from 'zustand';

// Define types for Tabs
export interface Tab {
  id: string;
  title: string;
  type: 'pdf' | 'note';
  pdfUrl?: string;
  content?: string;
}

interface PanelStore {
  activePageId: string | null;
  activeTabIds: Record<string, { leftPanelTabId: string | null; middlePanelTabId: string | null }>;
  pageTabs: Record<string, { leftPanelTabs: Tab[]; middlePanelTabs: Tab[] }>;
  setActivePageId: (pageId: string) => void;
  getTabsForPage: (pageId: string) => { leftPanelTabs: Tab[]; middlePanelTabs: Tab[] };
  getActiveTabsForPage: (pageId: string) => { leftPanelTabId: string | null; middlePanelTabId: string | null };
  setTabsForPage: (pageId: string, tabs: { leftPanelTabs: Tab[]; middlePanelTabs: Tab[] }) => void;
  addTabForPage: (pageId: string, tab: Tab, panel: 'left' | 'middle') => void;
  removeTabForPage: (pageId: string, tabId: string, panel: 'left' | 'middle') => void;
  setActiveTabForPage: (pageId: string, tabId: string, panel?: 'left' | 'middle') => void;
}


export const usePanelStore = create<PanelStore>((set, get) => ({
  activePageId: null,  // Initially no active page
  activeTabIds: {},    // Track active tab IDs for each page
  pageTabs: {},
  setActivePageId: (pageId) => set(() => ({ activePageId: pageId })),

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
