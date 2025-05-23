import type { Annotation } from "../../hooks/useAnnotations";
import { usePDFPageNumber } from "../../hooks/usePdfPageNumber";
import { AnnotationTooltip, type AnnotationTooltipContentProps } from "../annotation-tooltip";
import { usePdfStore } from "@/store/usePdfStore";

interface AnnotationHighlightLayerProps {
  className?: string;
  style?: React.CSSProperties;
  renderTooltipContent: (props: AnnotationTooltipContentProps) => React.ReactNode;
  renderHoverTooltipContent: (props: {
    annotation: Annotation;
    onClose: () => void;
  }) => React.ReactNode;
  focusedAnnotationId?: string;
  focusedHoverAnnotationId?: string;
  onAnnotationClick?: (annotation: Annotation) => void;
  tooltipClassName?: string;
  hoverTooltipClassName?: string;
  highlightClassName?: string;
  tooltipBubbleSize?: number;
  documentId: string;
}

export const AnnotationHighlightLayer = ({
  className,
  style,
  renderTooltipContent,
  renderHoverTooltipContent,
  tooltipClassName,
  highlightClassName,
  focusedAnnotationId,
  focusedHoverAnnotationId,
  onAnnotationClick,
  hoverTooltipClassName,
  tooltipBubbleSize = 6,
  documentId,
}: AnnotationHighlightLayerProps) => {
  const pageNumber = usePDFPageNumber();
  const { pdfs } = usePdfStore();
  const annotations = pdfs[documentId]?.highlights || [];

  const pageAnnotations = annotations.filter(
    (annotation: Annotation) => annotation.pageNumber === pageNumber
  );

  return (
    <div className={className} style={style}>
      {pageAnnotations.map((annotation: Annotation) => (
        <AnnotationTooltip
          key={annotation.id}
          annotation={annotation}
          className={tooltipClassName}
          hoverClassName={hoverTooltipClassName}
          isOpen={focusedAnnotationId === annotation.id}
          tooltipBubbleSize={tooltipBubbleSize}
          hoverIsOpen={focusedHoverAnnotationId === annotation.id}
          onOpenChange={(open) => {
            if (open && onAnnotationClick) {
              onAnnotationClick(annotation);
            }
          }}
          renderTooltipContent={renderTooltipContent}
          hoverTooltipContent={renderHoverTooltipContent({
            annotation,
            onClose: () => {},
          })}
        >
          <button
            type="button"
            style={{ cursor: "pointer", border: "none", background: "none", padding: 0, width: "100%" }}
            onClick={() => onAnnotationClick?.(annotation)}
            onKeyUp={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onAnnotationClick?.(annotation);
              }
            }}
          >
            {annotation.highlights.map((highlight, i) => (
              <div
                key={`${annotation.id}-highlight-${i}`}
                className={highlightClassName}
                style={{
                  position: "absolute",
                  top: highlight.top,
                  left: highlight.left,
                  width: highlight.width,
                  height: highlight.height,
                  backgroundColor: annotation.color,
                }}
                data-highlight-id={annotation.id}
              />
            ))}
          </button>
        </AnnotationTooltip>
      ))}
    </div>
  );
}; 