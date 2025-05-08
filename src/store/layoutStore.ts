import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type MinimizeTriggered = "settings" | "documents";
type LayoutState = {
  minimize: boolean;
  minSidebarWidth: number;
  maxSidebarWidth: number;
  sidebarWidth: number;
  minimizeTriggered?: MinimizeTriggered;
  isDragging: boolean;
  prevSidebarWidth: number;
};

type LayoutAction = {
  setMinimize: (v: boolean) => void;
  triggerMinimize: (v?: MinimizeTriggered) => void;
  setSidebarWidth: (width: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  resetSidebarWidth: () => void;

};

const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 240;
const MAX_WIDTH = 480;

export const useLayoutStore = create<LayoutState & LayoutAction>()(
  persist(
    (set, get) => ({
      minimize: false,
      minSidebarWidth: MIN_WIDTH,
      maxSidebarWidth: MAX_WIDTH,
      prevSidebarWidth: DEFAULT_WIDTH,
      sidebarWidth: DEFAULT_WIDTH,
      isDragging: false,

      setMinimize: (v) => set({ minimize: v }),
      
      triggerMinimize: (v) => set({ 
        minimizeTriggered: v, 
        minimize: true 
      }),
      
      
      setSidebarWidth: (width) => {
        const { minSidebarWidth, maxSidebarWidth } = get();
        // Ensure the width is within the allowed range
        const clampedWidth = Math.max(
          minSidebarWidth,
          Math.min(maxSidebarWidth, width)
        );
        set({ sidebarWidth: clampedWidth });
      },
      

      setIsDragging: (isDragging) => set({ isDragging }),
      
      resetSidebarWidth: () => set({ 
        sidebarWidth: DEFAULT_WIDTH,
        minimize: false 
      }),
    }),
    {
      name: "layout-storage",
      partialize: (state) => ({
        minimize: state.minimize,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);