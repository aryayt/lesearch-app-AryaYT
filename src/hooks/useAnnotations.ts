import { useCallback } from 'react';
import type { Annotation } from '@/anaralabs/lector';

interface AnnotationsState {
  annotations: Record<string, Annotation[]>;
}

interface AnnotationsStore extends AnnotationsState {
  addAnnotation: (documentId: string, annotation: Annotation) => void;
  getAnnotations: (documentId: string) => Annotation[];
  removeAnnotation: (documentId: string, annotationId: string) => void;
  updateAnnotation: (documentId: string, annotationId: string, updates: Partial<Annotation>) => void;
}

const initialState: AnnotationsState = {
  annotations: {},
};

export function useAnnotations(): AnnotationsStore {
  const addAnnotation = useCallback((documentId: string, annotation: Annotation) => {
    const state = initialState;
    if (!state.annotations[documentId]) {
      state.annotations[documentId] = [];
    }
    state.annotations[documentId].push(annotation);
  }, []);

  const getAnnotations = useCallback((documentId: string) => {
    return initialState.annotations[documentId] || [];
  }, []);

  const removeAnnotation = useCallback((documentId: string, annotationId: string) => {
    const state = initialState;
    if (!state.annotations[documentId]) return;
    state.annotations[documentId] = state.annotations[documentId].filter(
      (a) => a.id !== annotationId
    );
  }, []);

  const updateAnnotation = useCallback(
    (documentId: string, annotationId: string, updates: Partial<Annotation>) => {
      const state = initialState;
      if (!state.annotations[documentId]) return;
      state.annotations[documentId] = state.annotations[documentId].map((a) =>
        a.id === annotationId ? { ...a, ...updates } : a
      );
    },
    []
  );

  return {
    ...initialState,
    addAnnotation,
    getAnnotations,
    removeAnnotation,
    updateAnnotation,
  };
} 