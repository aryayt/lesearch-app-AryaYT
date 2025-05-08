// lib/stores/userStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserState {
  user: User | null;
  email: string | null;
  firstname: string | null;
  fullname: string | null;
  image: string | null;
  userLoading: boolean;
  userError: string | null;
  initialized: boolean;
  lastUpdated: number | null;
  
  // Actions
  fetchUser: () => Promise<void>;
  clearUser: () => void;
  isDataStale: () => boolean;
  signOutAsync: (scope?: "local" | "global" | "others") => Promise<void>;
}

// Time in milliseconds after which data is considered stale (30 minutes)
const STALE_TIME = 30 * 60 * 1000;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      email: null,
      firstname: null,
      fullname: null,
      image: null,
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

          const image = data.user?.user_metadata.image || data.user?.user_metadata.avatar_url;
          
          set({ 
            user: data.user, 
            userLoading: false, 
            userError: null,
            initialized: true,
            email: data.user?.email,
            firstname: data.user?.user_metadata.firstname,
            fullname: data.user?.user_metadata.full_name,
            image: image,
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
      async signOutAsync(scope = "local") {
        const message = {
          success: {
            local: "Successfully logged out.",
            global: "Successfully logged out all device",
            others: "Successfully logged out other device",
          },
          error: {
            local: "Something went wrong! Failed to log out",
            global: "Something went wrong! Failed to log out all device",
            others: "Something went wrong! Failed to log out other device",
          },
        };
        
        // Create a toast with a unique ID for tracking
        const toastId = toast.loading("Logging out...");
    
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signOut({ scope});
          if (error) throw new Error(error.message);
          toast.success(message.success[scope], { id: toastId });
          window.location.reload();
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message, { id: toastId });
          } else {
            toast.error(message.error[scope], { id: toastId });
          }
        }
      },
      
      clearUser: () => {
        set({ 
          user: null, 
          userError: null, 
          email: null,
          firstname: null,
          fullname: null,
          image: null,
          initialized: false,
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