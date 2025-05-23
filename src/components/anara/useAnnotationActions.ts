import { useCallback, useMemo } from "react";
import type { Annotation } from "@/anaralabs/lector";
import { usePdfStore } from "@/store/usePdfStore";

export const useAnnotationActions = (documentId: string) => {
  const { pdfs, updatePdfHighlightsAsync } = usePdfStore();
  const annotations = useMemo(() => pdfs[documentId]?.highlights || [], [pdfs, documentId]);

  const addAnnotation = useCallback((annotation: Annotation) => {
    const updatedAnnotations = [...annotations, annotation];
    updatePdfHighlightsAsync(documentId, updatedAnnotations);
  }, [documentId, annotations, updatePdfHighlightsAsync]);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    const updatedAnnotations = annotations.map((annotation) =>
      annotation.id === id
        ? {
            ...annotation,
            ...updates,
          }
        : annotation
    );
    updatePdfHighlightsAsync(documentId, updatedAnnotations);
  }, [documentId, annotations, updatePdfHighlightsAsync]);

  const deleteAnnotation = useCallback((id: string) => {
    const updatedAnnotations = annotations.filter(
      (annotation) => annotation.id !== id
    );
    updatePdfHighlightsAsync(documentId, updatedAnnotations);
  }, [documentId, annotations, updatePdfHighlightsAsync]);

  return {
    annotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
  };
}; 