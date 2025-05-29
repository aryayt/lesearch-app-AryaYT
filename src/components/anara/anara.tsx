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
  useSelectionDimensions,
  usePdfJump,
  AnnotationLayer,
} from "@/anaralabs/lector";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "pdfjs-dist/web/pdf_viewer.css";
import { useTheme } from "next-themes";
import GridLoader from "../loader/grid-loader";
import { GlobalWorkerOptions } from "pdfjs-dist";
import ZoomMenu from "./zoom-menu";
import DocumentMenu from "./document-menu";
import { PageNavigation } from "./page-navigation";
import {
  SelectionTooltipContent,
  AnnotationTooltip,
  type AnnotationTooltipProps,
} from "./annotations";
import { usePdfStore } from '@/store/usePdfStore';



GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface PDFContentProps {
  initialAnnotations?: Annotation[];
  focusedAnnotationId?: string;
  onAnnotationClick: (annotation: Annotation | null) => void;
}

const PDFContent = ({
  focusedAnnotationId,
  onAnnotationClick,
  documentId,
}: PDFContentProps & { documentId: string }) => {
  const { getDimension } = useSelectionDimensions();
  const { jumpToHighlightRects } = usePdfJump();
  const { pdfs, updatePdfHighlightsAsync } = usePdfStore();
  const currentAnnotations = useMemo(() => pdfs[documentId]?.highlights || [], [pdfs, documentId]);

  const handleCreateAnnotation = useCallback((color: string) => {
    const selection = getDimension();
    if (!selection || !selection.highlights.length) return;

    const newAnnotation = {
      pageNumber: selection.highlights[0].pageNumber,
      highlights: selection.highlights,
      color: color,
      borderColor: "rgba(255, 255, 0, 0.1)",
      text: selection.text,
      id: uuidv4(),
      documentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update UI immediately
    const updatedAnnotations = [...currentAnnotations, newAnnotation];
    updatePdfHighlightsAsync(documentId, updatedAnnotations); // Add optimistic flag

    // Clear selection
    window.getSelection()?.removeAllRanges();
  }, [getDimension, documentId, currentAnnotations, updatePdfHighlightsAsync]);


  useEffect(() => {
    if (!focusedAnnotationId) return;

    const annotation = currentAnnotations.find((a) => a.id === focusedAnnotationId);
    if (!annotation || !annotation.highlights.length) return;

    jumpToHighlightRects(annotation.highlights, "pixels", "start", -20);
  }, [focusedAnnotationId, currentAnnotations, jumpToHighlightRects]);

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
    ({ annotation, onClose }: AnnotationTooltipProps) => {
      return <AnnotationTooltip annotation={annotation} onClose={onClose} />;
    },
    []
  );

  const renderHoverTooltipContent = useCallback(
    ({ annotation }: AnnotationTooltipProps) => {
      return (
        <div className="bg-background p-2 shadow-lg text-sm border border-gray-300 rounded-md">
          {annotation.comment || 'No comment'}
        </div>
      );
    },
    []
  );

  const handleAskAI = useCallback(() => {
    console.log("Ask AI");
  }, []);

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
          tooltipClassName="bg-background shadow-lg rounded-lg p-2 min-w-[200px] border border-gray-300 rounded-md"
          onAnnotationClick={onAnnotationClick}
          renderTooltipContent={renderTooltipContent}
          renderHoverTooltipContent={renderHoverTooltipContent}
          documentId={documentId}
        />
        <SelectionTooltip>
          <SelectionTooltipContent 
            onHighlight={handleCreateAnnotation} 
            onAskAI={handleAskAI}
          />
        </SelectionTooltip>
      </Page>
    </Pages>
  );
};

export const AnaraViewer = ({
  pdfId,
  pdfUrl,
  pdfHighlights,
}: {
  pdfId: string;
  pdfUrl: string;
  pdfHighlights: Annotation[];
}) => {
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string>();
  const { getPdfAsync, pdfs, loadingPdfs, clearPdf } = usePdfStore();
  const { resolvedTheme } = useTheme();
  const pdf = pdfs[pdfId];
  const isLoading = loadingPdfs[pdfId];

  // Load PDF data on mount
  React.useEffect(() => {
    getPdfAsync(pdfId);
    
    // Cleanup when component unmounts or pdfId changes
    return () => {
      clearPdf(pdfId);
    };
  }, [pdfId, getPdfAsync, clearPdf]);

  const handleAnnotationClick = useCallback((annotation: Annotation | null) => {
    setFocusedAnnotationId(annotation?.id);
  }, []);

  // Use highlights from store if available, otherwise use props
  const currentHighlights = pdf?.highlights || pdfHighlights;

  if (isLoading && !pdf) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <GridLoader size="80" color={`${resolvedTheme==="light"?'#000000':'#ffffff'}`} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full">
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
          focusedAnnotationId={focusedAnnotationId}
          onAnnotationClick={handleAnnotationClick}
          documentId={pdfId}
        />
      </Root>
    </div>
  );
};