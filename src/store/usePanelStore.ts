import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LayoutState = {
  showMiddlePanel: boolean;
  showRightPanel: boolean;
};

type LayoutAction = {
  setShowMiddlePanel: (v: boolean) => void;
  setShowRightPanel: (v: boolean) => void;
};


export const usePanelStore = create<LayoutState & LayoutAction>()(
  persist(
    (set) => ({
      showMiddlePanel: true,
      showRightPanel: true,

      setShowMiddlePanel: (v: boolean) => set({ showMiddlePanel: v }),
      
      setShowRightPanel: (v: boolean) => set({ 
        showRightPanel: v, 
      }),

    }),
    {
      name: "layout-storage",
      partialize: (state) => ({
        showMiddlePanel: state.showMiddlePanel,
        showRightPanel: state.showRightPanel,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);