"use client";

import { v4 as uuidv4 } from "uuid";
import {
  CanvasLayer,
  Page,
  Pages,
  Root,
  TextLayer,
  AnnotationHighlightLayer,
  type Annotation,
  SelectionTooltip,
  useAnnotations,
  useSelectionDimensions,
  usePdfJump,
  AnnotationLayer,
} from "@/anaralabs/lector";
import React, { useCallback, useEffect, useState } from "react";
import "pdfjs-dist/web/pdf_viewer.css";

import { GlobalWorkerOptions } from "pdfjs-dist";
import ZoomMenu from "./zoom-menu";
import DocumentMenu from "./document-menu";
import { PageNavigation } from "./page-navigation";
import {
  SelectionTooltipContent,
  TooltipContent,
  type TooltipContentProps,
} from "./annotations";
import { usePdfStore } from '@/store/usePdfStore';

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface PDFContentProps {
  onAnnotationsChange: (annotations: Annotation[]) => void;
  initialAnnotations?: Annotation[];
  focusedAnnotationId?: string;
  onAnnotationClick: (annotation: Annotation | null) => void;
}

const PDFContent = ({
  onAnnotationsChange,
  focusedAnnotationId,
  onAnnotationClick,
  documentId,
}: PDFContentProps & { documentId: string }) => {
  const { addAnnotation, getAnnotations } = useAnnotations();
  const { getDimension } = useSelectionDimensions();
  const { jumpToHighlightRects } = usePdfJump();

  useEffect(() => {
    const annotations = getAnnotations(documentId);
    onAnnotationsChange(annotations);
  }, [getAnnotations, onAnnotationsChange, documentId]);

  const handleCreateAnnotation = useCallback(() => {
    const selection = getDimension();
    if (!selection || !selection.highlights.length) return;

    const newAnnotation = {
      pageNumber: selection.highlights[0].pageNumber,
      highlights: selection.highlights,
      color: "rgba(255, 255, 0, 0.3)",
      borderColor: "rgba(255, 255, 0, 0.1)",
      text: selection.text,
      id: uuidv4(),
      documentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addAnnotation(documentId, newAnnotation);
    window.getSelection()?.removeAllRanges();
  }, [addAnnotation, getDimension, documentId]);

  useEffect(() => {
    const annotations = getAnnotations(documentId);
    if (annotations.length === 0) return;

    const lastAnnotation = annotations[annotations.length - 1];
    const isNewAnnotation =
      Date.now() - new Date(lastAnnotation.createdAt).getTime() < 1000;

    if (isNewAnnotation) {
      onAnnotationClick(lastAnnotation);
    }
  }, [getAnnotations, onAnnotationClick, documentId]);

  useEffect(() => {
    if (!focusedAnnotationId) return;

    const annotations = getAnnotations(documentId);
    console.log(annotations)
    const annotation = annotations.find((a) => a.id === focusedAnnotationId);
    if (!annotation || !annotation.highlights.length) return;

    jumpToHighlightRects(annotation.highlights, "pixels", "center", -50);
  }, [focusedAnnotationId, getAnnotations, jumpToHighlightRects, documentId]);
  const handlePagesClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest('[role="tooltip"]')) {
        return;
      }

      const clickedHighlight = target.closest("[data-highlight-id]");

      // If we clicked on a highlight, let the AnnotationHighlightLayer handle it
      if (clickedHighlight) {
        return;
      }

      if (focusedAnnotationId) {
        onAnnotationClick(null);
      }
    },
    [focusedAnnotationId, onAnnotationClick]
  );

  const renderTooltipContent = useCallback(
    ({ annotation, onClose }: TooltipContentProps) => {
      return <TooltipContent annotation={annotation} onClose={onClose} />;
    },
    []
  );

  return (
    <Pages
      className="dark:invert-[94%] dark:hue-rotate-180 dark:brightness-[80%] dark:contrast-[228%] dark:bg-gray-100"
      onClick={handlePagesClick}
    >
      <Page>
        <CanvasLayer />
        <TextLayer />
        <AnnotationLayer />
        <AnnotationHighlightLayer
          className="dark:opacity-40 mix-blend-multiply transition-all duration-200 cursor-pointer"
          focusedAnnotationId={focusedAnnotationId}
          tooltipClassName="bg-white shadow-lg rounded-lg p-3 min-w-[200px]"
          onAnnotationClick={onAnnotationClick}
          renderTooltipContent={renderTooltipContent}
          renderHoverTooltipContent={renderTooltipContent}
          documentId={documentId}
        />
        <SelectionTooltip>
          <SelectionTooltipContent onHighlight={handleCreateAnnotation} />
        </SelectionTooltip>
      </Page>
    </Pages>
  );
};

export const AnaraViewer = ({
  pdfUrl,
  pdfHighlights,
}: {
  pdfUrl: string;
  pdfHighlights: Annotation[];
}) => {
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string>();
  const { getPdfAsync, updatePdfHighlightsAsync, pdf } = usePdfStore();
  const documentId = React.useMemo(() => {
    // Use the PDF URL as a unique identifier for the document
    return btoa(pdfUrl);
  }, [pdfUrl]);

  // Load PDF data on mount
  React.useEffect(() => {
    getPdfAsync(documentId);
  }, [documentId, getPdfAsync]);

  const handleAnnotationsChange = useCallback((annotations: Annotation[]) => {
    try {
      updatePdfHighlightsAsync(documentId, annotations);
    } catch (error) {
      console.error("Error saving annotations:", error);
    }
  }, [documentId, updatePdfHighlightsAsync]);

  const handleAnnotationClick = useCallback((annotation: Annotation | null) => {
    setFocusedAnnotationId(annotation?.id);
  }, []);

  // Use highlights from store if available, otherwise use props
  const currentHighlights = pdf?.highlights || pdfHighlights;

  return (
    <div className="flex flex-col gap-4 h-full">
      <Root
        className="border overflow-hidden flex flex-col w-full h-full rounded-lg"
        source={pdfUrl}
        isZoomFitWidth={true}
        loader={<div className="w-full" />}
      >
        <div className="p-1 relative flex justify-between border-b">
          <ZoomMenu />
          <PageNavigation />
          <DocumentMenu documentUrl={pdfUrl} />
        </div>
        <PDFContent
          initialAnnotations={currentHighlights}
          onAnnotationsChange={handleAnnotationsChange}
          focusedAnnotationId={focusedAnnotationId}
          onAnnotationClick={handleAnnotationClick}
          documentId={documentId}
        />
      </Root>
    </div>
  );
};
