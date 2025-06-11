import clsx from "clsx";
import type { HTMLProps } from "react";

import {
  type AnnotationLayerParams,
  useAnnotationLayer,
} from "../../hooks/layers/useAnnotationLayer";
import { useLayoutStore } from "@/store/layoutStore";

/**
 * AnnotationLayer renders PDF annotations like links, highlights, and form fields.
 * 
 * @param renderForms - Whether to render form fields in the annotation layer.
 * @param externalLinksEnabled - Whether external links should be clickable. When false, external links won't open.
 * @param jumpOptions - Options for page navigation behavior when clicking internal links. 
 *                      See `usePdfJump` hook for available options.
 * @param onExternalLinkClick - Callback when an external link is clicked
 */
export const AnnotationLayer = ({
  renderForms = true,
  externalLinksEnabled = true,
  jumpOptions = { behavior: "smooth", align: "start" },
  onExternalLinkClick,
  className,
  style,
  ...props
}: AnnotationLayerParams & HTMLProps<HTMLDivElement> & {
  onExternalLinkClick?: (url: string) => void;
}) => {
  const { setShowExternalLink } = useLayoutStore();

  const { annotationLayerRef } = useAnnotationLayer({
    renderForms,
    externalLinksEnabled,
    jumpOptions,
    onExternalLinkClick: (url) => {
      setShowExternalLink(true); // Show the popup when a link is clicked
      onExternalLinkClick?.(url);
    },
  });

  return (
    <div
      className={clsx("annotationLayer", className)}
      style={{
        ...style,
        position: "absolute",
        top: 0,
        left: 0,
      }}
      {...props}
      ref={annotationLayerRef}
    />
  );
};
