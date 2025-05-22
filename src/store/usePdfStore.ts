import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Annotation } from '@/anaralabs/lector';

interface Pdf {
  id: string;
  highlights: Annotation[];
}

export type Status = "start" | "success" | "failed" | null;

interface PdfState {
  pdfs: Record<string, Pdf>;
  loadingPdfs: Record<string, boolean>;
  updatingPdfs: Record<string, boolean>;
  errors: Record<string, string | null>;
  saveStatus: Record<string, Status>;
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
}

const initialState: PdfState = {
  pdfs: {},
  loadingPdfs: {},
  updatingPdfs: {},
  errors: {},
  saveStatus: {},
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
        .select('id, highlights')
        .eq('id', pdfId)
        .single();
      console.log(data,error);
      if (error) throw error;
      
      set(state => ({
        pdfs: { ...state.pdfs, [pdfId]: data },
        loadingPdfs: { ...state.loadingPdfs, [pdfId]: false }
      }));
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
    const state = get();
    
    if (eventType === "DELETE") {
      set(state => ({
        pdfs: { ...state.pdfs },
        loadingPdfs: { ...state.loadingPdfs },
        updatingPdfs: { ...state.updatingPdfs },
        errors: { ...state.errors },
        saveStatus: { ...state.saveStatus }
      }));
      delete state.pdfs[old.id];
      delete state.loadingPdfs[old.id];
      delete state.updatingPdfs[old.id];
      delete state.errors[old.id];
      delete state.saveStatus[old.id];
    } else if (eventType === "UPDATE") {
      set(state => ({
        pdfs: { ...state.pdfs, [pdf.id]: pdf },
        updatingPdfs: { ...state.updatingPdfs, [pdf.id]: false }
      }));
    }
  },

  updatePdfHighlightsAsync: async (pdfId: string, highlights: Annotation[]) => {
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
        pdfs: { ...state.pdfs, [pdfId]: { ...state.pdfs[pdfId], highlights } },
        updatingPdfs: { ...state.updatingPdfs, [pdfId]: false },
        saveStatus: { ...state.saveStatus, [pdfId]: 'success' }
      }));
    } catch (err) {
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

  clearPdf: (pdfId: string) => {
    set(state => {
      const newState = { ...state };
      delete newState.pdfs[pdfId];
      delete newState.loadingPdfs[pdfId];
      delete newState.updatingPdfs[pdfId];
      delete newState.errors[pdfId];
      delete newState.saveStatus[pdfId];
      return newState;
    });
  }
})); 