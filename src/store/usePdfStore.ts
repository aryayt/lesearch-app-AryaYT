import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Annotation } from '@/anaralabs/lector';

interface Pdf {
  id: string;
  name: string;
  highlights: Annotation[];
}

export type Status = "start" | "success" | "failed" | null;

interface SelectedText {
  text: string;
  documentId: string;
  documentName: string;
}

interface PdfState {
  pdfs: Record<string, Pdf>;
  loadingPdfs: Record<string, boolean>;
  updatingPdfs: Record<string, boolean>;
  errors: Record<string, string | null>;
  saveStatus: Record<string, Status>;
  selectedText: SelectedText | null;
}

interface PdfStore extends PdfState {
  setSaveStatus(pdfId: string, status: Status): void;
  getPdfAsync: (pdfId: string) => Promise<void>;
  pdfRealtimeHandler: (payload: { 
    eventType: string; 
    pdf: Pdf; 
    old: { id: string; uuid: string } 
  }) => void;
  updatePdfHighlightsAsync: (pdfId: string, highlights: Annotation[]) => Promise<void>;
  clearPdf: (pdfId: string) => void;
  subscribeToPdfChanges: (pdfId: string) => void;
  unsubscribeFromPdfChanges: (pdfId: string) => void;
  setSelectedText: (text: string, documentId: string, documentName: string) => void;
  clearSelectedText: () => void;
}

const initialState: PdfState = {
  pdfs: {},
  loadingPdfs: {},
  updatingPdfs: {},
  errors: {},
  saveStatus: {},
  selectedText: null,
};

export const usePdfStore = create<PdfStore>((set, get) => ({
  ...initialState,

  setSaveStatus: (pdfId, status) => 
    set(state => ({
      saveStatus: { ...state.saveStatus, [pdfId]: status }
    })),

  getPdfAsync: async (pdfId: string) => {
    set(state => ({
      loadingPdfs: { ...state.loadingPdfs, [pdfId]: true },
      errors: { ...state.errors, [pdfId]: null }
    }));

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pdfs')
        .select('id, name, highlights')
        .eq('id', pdfId)
        .single();

      if (error) throw error;
      
      set(state => ({
        pdfs: { 
          ...state.pdfs, 
          [pdfId]: { 
            ...data,
            highlights: data.highlights || []
          }
        },
        loadingPdfs: { ...state.loadingPdfs, [pdfId]: false }
      }));

      // Subscribe to realtime updates after initial fetch
      get().subscribeToPdfChanges(pdfId);
    } catch (err) {
      set(state => ({ 
        errors: { 
          ...state.errors, 
          [pdfId]: err instanceof Error ? err.message : 'Failed to fetch PDF'
        },
        loadingPdfs: { ...state.loadingPdfs, [pdfId]: false }
      }));
    }
  },

  pdfRealtimeHandler: ({ eventType, pdf, old }) => {
    if (eventType === "DELETE") {
      set(state => {
        const newState = { ...state };
        delete newState.pdfs[old.id];
        delete newState.loadingPdfs[old.id];
        delete newState.updatingPdfs[old.id];
        delete newState.errors[old.id];
        delete newState.saveStatus[old.id];
        return newState;
      });
    } else if (eventType === "UPDATE") {
      set(state => ({
        pdfs: { 
          ...state.pdfs, 
          [pdf.id]: { 
            ...pdf,
            highlights: pdf.highlights || state.pdfs[pdf.id]?.highlights || []
          }
        },
        updatingPdfs: { ...state.updatingPdfs, [pdf.id]: false }
      }));
    }
  },

  updatePdfHighlightsAsync: async (pdfId: string, highlights: Annotation[]) => {
    // Update UI immediately by default
    set(state => ({
      pdfs: { 
        ...state.pdfs, 
        [pdfId]: { 
          ...state.pdfs[pdfId],
          highlights 
        }
      }
    }));

    set(state => ({
      updatingPdfs: { ...state.updatingPdfs, [pdfId]: true },
      errors: { ...state.errors, [pdfId]: null },
      saveStatus: { ...state.saveStatus, [pdfId]: 'start' }
    }));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('pdfs')
        .update({ highlights })
        .eq('id', pdfId);

      if (error) throw error;
      
      set(state => ({
        updatingPdfs: { ...state.updatingPdfs, [pdfId]: false },
        saveStatus: { ...state.saveStatus, [pdfId]: 'success' }
      }));
    } catch (err) {
      // Revert changes on error
      set(state => ({
        pdfs: { 
          ...state.pdfs, 
          [pdfId]: { 
            ...state.pdfs[pdfId],
            highlights: state.pdfs[pdfId]?.highlights || []
          }
        }
      }));

      set(state => ({ 
        errors: { 
          ...state.errors, 
          [pdfId]: err instanceof Error ? err.message : 'Failed to update PDF highlights'
        },
        updatingPdfs: { ...state.updatingPdfs, [pdfId]: false },
        saveStatus: { ...state.saveStatus, [pdfId]: 'failed' }
      }));
    }
  },

  subscribeToPdfChanges: (pdfId: string) => {
    const supabase = createClient();
    const channel = supabase
      .channel(`pdf-${pdfId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pdfs',
          filter: `id=eq.${pdfId}`
        },
        (payload) => {
          get().pdfRealtimeHandler({
            eventType: payload.eventType,
            pdf: payload.new as Pdf,
            old: payload.old as { id: string; uuid: string }
          });
        }
      )
      .subscribe();
    return channel;
  },

  unsubscribeFromPdfChanges: (pdfId: string) => {
    const supabase = createClient();
    const channel = supabase.channel(`pdf-${pdfId}`);
    supabase.removeChannel(channel);
  },

  clearPdf: (pdfId: string) => {
    get().unsubscribeFromPdfChanges(pdfId);
    set(state => {
      const newState = { ...state };
      delete newState.pdfs[pdfId];
      delete newState.loadingPdfs[pdfId];
      delete newState.updatingPdfs[pdfId];
      delete newState.errors[pdfId];
      delete newState.saveStatus[pdfId];
      return newState;
    });
  },

  setSelectedText: (text: string, documentId: string, documentName: string) => {
    set((state) => ({
      ...state,
      selectedText: {
        text,
        documentId,
        documentName,
      },
    }));
  },

  clearSelectedText: () => {
    set({ selectedText: null });
  }
}));