import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface Doc {
  id: string;
  content: string | null;
}
export type Status = "start" | "success" | "failed" | null;


interface DocStore {
  doc: Doc | null;
  loadingDoc: boolean;
  error: string | null;
  saveStatus: Status;
  setSaveStatus(status: Status): void;
  getDocAsync: (docId: string) => Promise<void>;
  docRealtimeHandler: (payload: { 
    eventType: string; 
    doc: Doc; 
    old: { id: string; uuid: string } 
  }) => void;
  updateDocAsync: (docId: string, updates: { content: string }) => Promise<void>;
}

const initialState = {
  doc: null,
  loadingDoc: false,
  saveStatus: null,
  error: null,
};

export const useDocStore = create<DocStore>((set, get) => ({
  ...initialState,

  setSaveStatus: (status) => set({ saveStatus: status }),

  getDocAsync: async (docId: string) => {
    set({ loadingDoc: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('notes')
        .select('id, content')
        .eq('id', docId)
        .single();

      if (error) throw error;
      set({ doc: data, loadingDoc: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch document',
        loadingDoc: false 
      });
    }
  },

  docRealtimeHandler: ({ eventType, doc, old }) => {
    const currentDoc = get().doc;
    
    if (!currentDoc) return;

    if (eventType === "DELETE" && currentDoc.id === old.id) {
      set(initialState);
    } else if (eventType === "UPDATE" && currentDoc.id === doc.id) {
      set({ 
        doc: {
          ...currentDoc,
          content: doc.content
        }, 
        loadingDoc: false 
      });
    }
  },

  updateDocAsync: async (docId: string, updates: { content: string }) => {
    set({ loadingDoc: true, error: null, saveStatus: 'start' });
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notes')
        .update({ content: updates.content })
        .eq('id', docId);

      if (error) throw error;
      
      // Update local state
      set(state => ({
        doc: state.doc ? { ...state.doc, content: updates.content } : null,
        loadingDoc: false,
        saveStatus: 'success'
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update document',
        loadingDoc: false,
        saveStatus: 'failed'
      });
    }
  }
}));
