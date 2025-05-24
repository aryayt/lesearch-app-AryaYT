import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface Doc {
  id: string;
  content: string | null;
}

export type Status = "start" | "success" | "failed" | null;

interface DocState {
  docs: Record<string, Doc>;
  loadingDocs: Record<string, boolean>;
  updatingDocs: Record<string, boolean>;
  errors: Record<string, string | null>;
  saveStatus: Record<string, Status>;
}

interface DocStore extends DocState {
  setSaveStatus(docId: string, status: Status): void;
  getDocAsync: (docId: string) => Promise<void>;
  docRealtimeHandler: (payload: { 
    eventType: string; 
    doc: Doc; 
    old: { id: string; uuid: string } 
  }) => void;
  updateDocAsync: (docId: string, updates: { content: string }) => Promise<void>;
  clearDoc: (docId: string) => void;
}

const initialState: DocState = {
  docs: {},
  loadingDocs: {},
  updatingDocs: {},
  errors: {},
  saveStatus: {},
};

export const useDocStore = create<DocStore>((set, get) => ({
  ...initialState,

  setSaveStatus: (docId, status) => 
    set(state => ({
      saveStatus: { ...state.saveStatus, [docId]: status }
    })),

  getDocAsync: async (docId: string) => {
    console.log('getDocAsync called:', docId);
    set(state => ({
      loadingDocs: { ...state.loadingDocs, [docId]: true },
      errors: { ...state.errors, [docId]: null }
    }));

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('notes')
        .select('id, content')
        .eq('id', docId)
        .single();

      if (error) throw error;
      
      console.log('getDocAsync success:', { docId, data });
      set(state => ({
        docs: { ...state.docs, [docId]: data },
        loadingDocs: { ...state.loadingDocs, [docId]: false }
      }));
    } catch (err) {
      console.error('getDocAsync error:', { docId, err });
      set(state => ({ 
        errors: { 
          ...state.errors, 
          [docId]: err instanceof Error ? err.message : 'Failed to fetch document'
        },
        loadingDocs: { ...state.loadingDocs, [docId]: false }
      }));
    }
  },

  docRealtimeHandler: ({ eventType, doc, old }) => {
    console.log('docRealtimeHandler:', { eventType, doc, old });
    const state = get();
    
    if (eventType === "DELETE") {
      set(state => ({
        docs: { ...state.docs },
        loadingDocs: { ...state.loadingDocs },
        updatingDocs: { ...state.updatingDocs },
        errors: { ...state.errors },
        saveStatus: { ...state.saveStatus }
      }));
      delete state.docs[old.id];
      delete state.loadingDocs[old.id];
      delete state.updatingDocs[old.id];
      delete state.errors[old.id];
      delete state.saveStatus[old.id];
    } else if (eventType === "UPDATE" || eventType === "INSERT") {
      console.log('Updating doc from realtime:', { docId: doc.id, content: doc.content });
      set(state => ({
        docs: { ...state.docs, [doc.id]: doc },
        loadingDocs: { ...state.loadingDocs, [doc.id]: false },
        updatingDocs: { ...state.updatingDocs, [doc.id]: false }
      }));
    }
  },

  updateDocAsync: async (docId: string, updates: { content: string }) => {
    set(state => ({
      updatingDocs: { ...state.updatingDocs, [docId]: true },
      errors: { ...state.errors, [docId]: null },
      saveStatus: { ...state.saveStatus, [docId]: 'start' }
    }));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notes')
        .update({ content: updates.content })
        .eq('id', docId);

      if (error) throw error;
      
      set(state => ({
        docs: { ...state.docs, [docId]: { ...state.docs[docId], content: updates.content } },
        updatingDocs: { ...state.updatingDocs, [docId]: false },
        saveStatus: { ...state.saveStatus, [docId]: 'success' }
      }));
    } catch (err) {
      set(state => ({ 
        errors: { 
          ...state.errors, 
          [docId]: err instanceof Error ? err.message : 'Failed to update document'
        },
        updatingDocs: { ...state.updatingDocs, [docId]: false },
        saveStatus: { ...state.saveStatus, [docId]: 'failed' }
      }));
    }
  },

  clearDoc: (docId: string) => {
    set(state => {
      const newState = { ...state };
      delete newState.docs[docId];
      delete newState.loadingDocs[docId];
      delete newState.updatingDocs[docId];
      delete newState.errors[docId];
      delete newState.saveStatus[docId];
      return newState;
    });
  }
}));
