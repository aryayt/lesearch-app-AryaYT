// lib/stores/userStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  userLoading: boolean;
  userError: string | null;
  initialized: boolean;
  lastUpdated: number | null;
  
  // Actions
  fetchUser: () => Promise<void>;
  clearUser: () => void;
  isDataStale: () => boolean;
}

// Time in milliseconds after which data is considered stale (30 minutes)
const STALE_TIME = 30 * 60 * 1000;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      userLoading: false,
      userError: null,
      initialized: false,
      lastUpdated: null,
      
      isDataStale: () => {
        const lastUpdated = get().lastUpdated;
        if (!lastUpdated) return true;
        
        const now = Date.now();
        return (now - lastUpdated) > STALE_TIME;
      },
      
      fetchUser: async () => {
        if (get().userLoading) return;
        
        set({ userLoading: true, userError: null });
        
        try {
          const supabase = createClient();
          
          // Get the user data
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            throw error;
          }
          
          set({ 
            user: data.user, 
            userLoading: false, 
            userError: null,
            initialized: true,
            lastUpdated: Date.now()
          });
          
        } catch (error) {
          // console.error('Error fetching user:', error);
          set({ 
            userError: error instanceof Error ? error.message : 'Authentication error',
            userLoading: false,
            initialized: true,
            lastUpdated: Date.now()
          });
        }
      },
      
      clearUser: () => {
        set({ 
          user: null, 
          userError: null, 
          lastUpdated: Date.now() 
        });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({ 
        user: state.user,
        initialized: state.initialized,
        lastUpdated: state.lastUpdated
      }),
    }
  )
);

// Setup auth state change listener
export const initUserStore = () => {
  const supabase = createClient();
  
  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, ) => {
    // console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      useUserStore.getState().fetchUser();
    } else if (event === 'SIGNED_OUT') {
      useUserStore.getState().clearUser();
    }
  });
  
  // Handle stale data on initial load
  const state = useUserStore.getState();
  if (!state.user || state.isDataStale()) {
    state.fetchUser();
  }
  
  // Return the subscription for cleanup in strict mode
  return () => {
    subscription.unsubscribe();
  };
};