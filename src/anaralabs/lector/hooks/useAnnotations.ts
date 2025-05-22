import { create } from "zustand";

export interface Annotation {
  id: string;
  documentId: string;
  pageNumber: number;
  highlights: Array<{
    height: number;
    left: number;
    top: number;
    width: number;
    pageNumber: number;
  }>;
  color: string;
  borderColor: string;
  createdAt: Date;
  updatedAt: Date;
  comment?: string;
  metadata?: Record<string, unknown>;
}

interface AnnotationState {
  annotations: Record<string, Annotation[]>;
  addAnnotation: (documentId: string, annotation: Annotation) => void;
  updateAnnotation: (documentId: string, id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (documentId: string, id: string) => void;
  setAnnotations: (documentId: string, annotations: Annotation[]) => void;
  getAnnotations: (documentId: string) => Annotation[];
}

export const useAnnotations = create<AnnotationState>((set, get) => ({
  annotations: {},
  addAnnotation: (documentId, annotation) =>
    set((state) => ({
      annotations: {
        ...state.annotations,
        [documentId]: [
          ...(state.annotations[documentId] || []),
          annotation,
        ],
      },
    })),
  updateAnnotation: (documentId, id, updates) =>
    set((state) => ({
      annotations: {
        ...state.annotations,
        [documentId]: (state.annotations[documentId] || []).map((annotation) =>
          annotation.id === id
            ? {
              ...annotation,
              ...updates,
            }
            : annotation
        ),
      },
    })),
  deleteAnnotation: (documentId, id) =>
    set((state) => ({
      annotations: {
        ...state.annotations,
        [documentId]: (state.annotations[documentId] || []).filter(
          (annotation) => annotation.id !== id
        ),
      },
    })),
  setAnnotations: (documentId, annotations) =>
    set((state) => ({
      annotations: {
        ...state.annotations,
        [documentId]: annotations,
      },
    })),
  getAnnotations: (documentId) => get().annotations[documentId] || [],
})); 