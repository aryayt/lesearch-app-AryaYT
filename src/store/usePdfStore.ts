import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Annotation } from '@/anaralabs/lector';

interface Pdf {
  id: string;
  highlights: Annotation[];
}

export type Status = "start" | "success" | "failed" | null;

interface PdfStore {
  pdf: Pdf | null;
  loadingPdf: boolean;
  error: string | null;
  saveStatus: Status;
  setSaveStatus(status: Status): void;
  getPdfAsync: (pdfId: string) => Promise<void>;
  pdfRealtimeHandler: (payload: { 
    eventType: string; 
    pdf: Pdf; 
    old: { id: string; uuid: string } 
  }) => void;
  updatePdfHighlightsAsync: (pdfId: string, highlights: Annotation[]) => Promise<void>;
}

const initialState = {
  pdf: null,
  loadingPdf: false,
  saveStatus: null,
  error: null,
};

export const usePdfStore = create<PdfStore>((set, get) => ({
  ...initialState,

  setSaveStatus: (status) => set({ saveStatus: status }),

  getPdfAsync: async (pdfId: string) => {
    set({ loadingPdf: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pdfs')
        .select('id, highlights')
        .eq('id', pdfId)
        .single();

      if (error) throw error;
      set({ pdf: data, loadingPdf: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch PDF',
        loadingPdf: false 
      });
    }
  },

  pdfRealtimeHandler: ({ eventType, pdf, old }) => {
    const currentPdf = get().pdf;
    
    if (!currentPdf) return;

    if (eventType === "DELETE" && currentPdf.id === old.id) {
      set(initialState);
    } else if (eventType === "UPDATE" && currentPdf.id === pdf.id) {
      set({ 
        pdf: {
          ...currentPdf,
          highlights: pdf.highlights
        }, 
        loadingPdf: false 
      });
    }
  },

  updatePdfHighlightsAsync: async (pdfId: string, highlights: Annotation[]) => {
    set({ loadingPdf: true, error: null, saveStatus: 'start' });
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('pdfs')
        .update({ highlights })
        .eq('id', pdfId);

      if (error) throw error;
      
      // Update local state
      set(state => ({
        pdf: state.pdf ? { ...state.pdf, highlights } : null,
        loadingPdf: false,
        saveStatus: 'success'
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update PDF highlights',
        loadingPdf: false,
        saveStatus: 'failed'
      });
    }
  }
})); 