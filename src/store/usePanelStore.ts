import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Tab interface to define the structure of a Tab.
interface Tab {
  id: string;
  title: string;
  content?: string;
  type: string;
}

// PanelTabsState interface to store the state of each page's tabs and visibility.
type PanelTabsState = {
  [pageId: string]: {
    leftPanelTabs: Tab[]; // List of tabs in the left panel
    activeLeftTabId?: string;
    middlePanelTabs: Tab[];
    activeMiddleTabId?: string;
    panelVisibility: {
      showMiddlePanel: boolean;
      showRightPanel: boolean;
    };
  };
};

// Create the store using Zustand with persistence.
export const usePanelStore = create<{
  panelTabs: PanelTabsState;
  setLeftPanelTabs: (pageId: string, tabs: Tab[], activeId?: string) => void;
  setMiddlePanelTabs: (pageId: string, tabs: Tab[], activeId?: string) => void;
  setPanelVisibility: (pageId: string, visibility: { showMiddlePanel: boolean; showRightPanel: boolean }) => void;
}>()(
  persist(
    (set) => ({
      panelTabs: {}, // Initial state is empty; will store panel states per page.
      
      // Function to update left panel tabs and their active tab.
      setLeftPanelTabs: (pageId: string, tabs: Tab[], activeId?: string) =>
        set((state) => ({
          panelTabs: {
            ...state.panelTabs,
            [pageId]: {
              ...state.panelTabs[pageId],
              leftPanelTabs: tabs,
              activeLeftTabId: activeId,
            },
          },
        })),

      // Function to update middle panel tabs and their active tab.
      setMiddlePanelTabs: (pageId: string, tabs: Tab[], activeId?: string) =>
        set((state) => ({
          panelTabs: {
            ...state.panelTabs,
            [pageId]: {
              ...state.panelTabs[pageId],
              middlePanelTabs: tabs,
              activeMiddleTabId: activeId,
            },
          },
        })),

      // Function to update the visibility of the panels (middle and right) for a particular page.
      setPanelVisibility: (pageId: string, visibility: { showMiddlePanel: boolean; showRightPanel: boolean }) =>
        set((state) => ({
          panelTabs: {
            ...state.panelTabs,
            [pageId]: {
              ...state.panelTabs[pageId],
              panelVisibility: visibility, // Only update the visibility, no need to overwrite the entire `panelTabs` object.
            },
          },
        })),
    }),
    {
      name: "layout-storage", // Name of the storage key to persist the state.
      partialize: (state) => ({ panelTabs: state.panelTabs }), // Only persist the `panelTabs` portion.
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence.
    }
  )
);
