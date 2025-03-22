// lib/stores/userStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastUpdated: number | null;
  
  // Actions
  fetchUser: () => Promise<void>;
  updateUserData: (userData: Record<string, unknown>) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearUser: () => void;
  isDataStale: () => boolean;
}

// Time in milliseconds after which data is considered stale (30 minutes)
const STALE_TIME = 30 * 60 * 1000;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      initialized: false,
      lastUpdated: null,
      
      isDataStale: () => {
        const lastUpdated = get().lastUpdated;
        if (!lastUpdated) return true;
        
        const now = Date.now();
        return (now - lastUpdated) > STALE_TIME;
      },
      
      
      fetchUser: async () => {
        if (get().loading) return;
        
        // If we have a user and data is not stale, don't fetch again
        // if (get().user && !get().isDataStale() && get().initialized) {
        //   return;
        // }
        
        set({ loading: true, error: null });
        
        try {
          const supabase = createClient();
          
          // Get the user data
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            throw error;
          }
          
          set({ 
            user: data.user, 
            loading: false, 
            error: null,
            initialized: true,
            lastUpdated: Date.now()
          });
          
        } catch (error) {
          // console.error('Error fetching user:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Authentication error',
            loading: false,
            initialized: true,
            lastUpdated: Date.now()
          });
        }
      },
      
      updateUserData: async (userData: Record<string, unknown> | { data: Record<string, unknown>, password?: string }) => {
        set({ loading: true, error: null });
        
        try {
          const supabase = createClient();
          
          let updateOptions: Record<string, unknown> = {};
  
          if ('data' in userData && typeof userData.data === 'object') {
            // Handle the combined format with both data and possibly password
            updateOptions = {
              data: userData.data
            };
            
            // Add password if it exists
            if (userData.password) {
              updateOptions.password = userData.password;
            }
          } else {
            // Handle the simple case where userData is just metadata
              updateOptions = {
              data: userData
            };
          }
          
          const { error } = await supabase.auth.updateUser({
            ...updateOptions
          });
          
          if (error) {
            throw error;
          }
          
          // Fetch fresh user data to update the store
          await get().fetchUser();
          
        } catch (error) {
          // console.error('Error updating user:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Update error',
            loading: false 
          });
          throw error; // Re-throw for handling in the component
        }
      },
      
      updatePassword: async (password: string) => {
        set({ loading: true, error: null });
        
        try {
          const supabase = createClient();
          
          const { error } = await supabase.auth.updateUser({
            password: password
          });
          
          if (error) {
            throw error;
          }
          
          // Fetch fresh user data
          await get().fetchUser();
          
        } catch (error) {
          // console.error('Error updating password:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Password update error',
            loading: false 
          });
          throw error; // Re-throw for handling in the component
        }
      },
      
      clearUser: () => {
        set({ 
          user: null, 
          error: null, 
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