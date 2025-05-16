import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

// Define the Pdf and Note data types
interface PdfData {
  id: string;
  name: string;
  pdf_url: string;
}

interface NoteData {
  id: string;
  title: string;
  content: string;
}

// Define the store type
interface PageStore {
  isPageLoading: boolean;
  error: string | null;
  pageData: PdfData | NoteData | null; // Can be PdfData or NoteData based on the page type
  fetchPageData: (pageId: string, pageType: 'pdf' | 'note') => void;
  setIsPageLoading: (loading: boolean) => void;
}

export const usePageStore = create<PageStore>((set) => ({
  isPageLoading: true, // Initially, the page is loading
  pageData: null, // Initially, no page data
  error: null, // Initially, no error
  setIsPageLoading: (loading) => set(() => ({ isPageLoading: loading })),
  
  // Action to fetch page data
  fetchPageData: async (pageId, pageType) => {

    try {
      set(() => ({ isPageLoading: true, error: null })); // Set loading to true and reset error

      // Fetch page data based on type (pdf or note)
      const { data, error } = await fetchPageByType( pageId, pageType);

      if (error) {
        console.error("Error fetching page data:", error);
        set(() => ({ pageData: null, error: error as string }));
      } else {
        set(() => ({ pageData: data, error: null }));
      }
    } catch (error) {
      console.error("Error fetching page data:", error);
      set(() => ({ pageData: null, error: error as string }));
    } finally {
      set(() => ({ isPageLoading: false })); // Set loading to false after the fetch
    }
  },
}));

// Helper function to fetch data based on type
const fetchPageByType = async ( pageId: string, pageType: 'pdf' | 'note') => {
    const supabase = createClient();
  if (pageType === 'pdf') {
    const { data, error } = await supabase.from('pdfs').select('*').eq('id', pageId).single(); // single() returns only one item
    return { data:{
        id: data?.id,
        name: data?.name,
        pdf_url: data?.pdf_url,
    }, error };
  }

  if (pageType === 'note') {
    const { data, error } = await supabase.from('notes').select('*').eq('id', pageId).single(); // single() for note as well
    return { data:{
        id: data?.id,
        title: data?.title,
        content: data?.content,
    }, error };
  }

  return { data: null, error: 'Invalid page type' }; // Handle unexpected types
};
