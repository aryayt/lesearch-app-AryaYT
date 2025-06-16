import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface APIKey {
  id: string;
  provider: string;
  api_key: string;
  active_models: string[];
  isVerified: boolean;
}

interface DatabaseAPIKey {
  id: string;
  provider: string;
  api_key_ff: string;
  active_models: string[];
}

interface APIKeyState {
  apiKeys: Record<string, APIKey>;
  activeModels: Record<string, string[]>;
  selectedModel: string;
  isLoading: Record<string, boolean>;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  verifyAPIKey: (provider: string, apiKey: string) => Promise<void>;
  toggleModel: (modelId: string, provider: string) => Promise<void>;
  setSelectedModel: (modelId: string) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  updateInputKey: (provider: string, key: string) => void;
}

export const useAPIKeyStore = create<APIKeyState>()(
  persist(
    (set, get) => ({
      apiKeys: {},
      activeModels: {},
      selectedModel: '',
      isLoading: {},
      error: null,
      isInitialized: false,

      initialize: async () => {
        const state = get();
        if (state.isInitialized) return;
        
        set({ 
          isLoading: { ...state.isLoading, initialize: true },
          error: null 
        });
        
        try {
          const response = await fetch('/api/fetch-keys');
          const data = await response.json();
          
          const transformedData = data.reduce((acc: Record<string, APIKey>, key: DatabaseAPIKey) => {
            acc[key.provider] = {
              id: key.id,
              provider: key.provider,
              api_key: key.api_key_ff + "•".repeat(36),
              active_models: key.active_models || [],
              isVerified: true
            };
            return acc;
          }, {});
          
          // Initialize activeModels for each provider
          const initialActiveModels = data.reduce((acc: Record<string, string[]>, key: DatabaseAPIKey) => {
            acc[key.provider] = key.active_models || [];
            return acc;
          }, {});
          
          set({ 
            apiKeys: transformedData,
            activeModels: initialActiveModels,
            isInitialized: true,
            isLoading: { ...state.isLoading, initialize: false }
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch API keys',
            isInitialized: true,
            isLoading: { ...state.isLoading, initialize: false }
          });
        }
      },
      
      verifyAPIKey: async (provider: string, apiKey: string) => {
        const state = get();
        if (!state.isInitialized) {
          return state.initialize();
        }
        set({ 
          isLoading: { ...state.isLoading, [provider]: true },
          error: null 
        });
        try {
          const response = await fetch('/api/verify-key', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ provider, apiKey }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to verify API key');
          }

          const data = await response.json();
          
          set(state => ({
            apiKeys: {
              ...state.apiKeys,
              [provider]: {
                id: data.id,
                provider,
                api_key: apiKey.slice(0, 4) + "•".repeat(36),
                active_models: [],
                isVerified: true 
              }
            },
            activeModels: {
              ...state.activeModels,
              [provider]: []
            },
            isLoading: { ...state.isLoading, [provider]: false }
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to verify API key',
            isLoading: { ...get().isLoading, [provider]: false }
          });
        }
      },

      updateInputKey: (provider: string, key: string) => {
        set(state => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: {
              ...state.apiKeys[provider],
              api_key_ff: key
            }
          }
        }));
      },

      toggleModel: async (modelId: string, provider: string) => {
        const state = get();
        if (!state.isInitialized) {
          return state.initialize();
        }

        if (!provider) return;

        // Store the previous state for potential rollback
        const previousState = {
          activeModels: { ...state.activeModels },
          apiKeys: { ...state.apiKeys }
        };

        // Calculate new active models
        const newActiveModels = state.activeModels[provider].includes(modelId)
          ? state.activeModels[provider].filter(id => id !== modelId)
          : [...state.activeModels[provider], modelId];

        // Optimistically update the UI
        set(state => ({
          activeModels: {
            ...state.activeModels,
            [provider]: newActiveModels
          },
          apiKeys: {
            ...state.apiKeys,
            [provider]: {
              ...state.apiKeys[provider],
              active_models: newActiveModels
            }
          },
          isLoading: { ...state.isLoading, [modelId]: true }
        }));

        try {
          const response = await fetch('/api/update-models', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              provider,
              active_models: newActiveModels 
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update models');
          }

          // Update loading state on success
          set(state => ({
            isLoading: { ...state.isLoading, [modelId]: false }
          }));
        } catch (error) {
          // Rollback to previous state on error
          set({
            activeModels: previousState.activeModels,
            apiKeys: previousState.apiKeys,
            isLoading: { ...get().isLoading, [modelId]: false },
            error: error instanceof Error ? error.message : 'Failed to update models'
          });
        }
      },

      setSelectedModel: (modelId: string) => {
        set({ selectedModel: modelId });
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'api-keys-storage',
      partialize: (state) => ({ 
        activeModels: state.activeModels,
        selectedModel: state.selectedModel,
      }),
    }
  )
); 