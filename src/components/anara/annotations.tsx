import type { Annotation } from "@/anaralabs/lector";
import { useCallback, useState } from "react";
import { useAnnotationActions } from "./useAnnotationActions";
import { WandSparklesIcon } from "lucide-react";
import { ToolbarGroup } from "@/components/ui/toolbar";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toolbarButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-checked:bg-accent aria-checked:text-accent-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 min-w-9 px-2',
        lg: 'h-10 min-w-10 px-2.5',
        sm: 'h-8 min-w-8 px-1.5',
      },
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
      },
    },
  }
);

interface SelectionTooltipContentProps {
  onHighlight: () => void;
  onAskAI: () => void;
}

export const SelectionTooltipContent = ({ onHighlight, onAskAI }: SelectionTooltipContentProps) => {
  return (
    <ToolbarGroup>
      <button
        type="button"
        className={cn(toolbarButtonVariants({ size: "default" }))}
        onClick={onAskAI}
      >
        <WandSparklesIcon className="h-4 w-4" />
        Ask AI
      </button>
      <button
        type="button"
        className={cn(toolbarButtonVariants({ size: "default" }))}
        onClick={onHighlight}
      >
        Add Annotation
      </button>
    </ToolbarGroup>
  );
};

interface AnnotationListProps {
  annotations: Annotation[];
  focusedAnnotationId?: string;
  onAnnotationClick: (annotation: Annotation) => void;
}

export const AnnotationList = ({ annotations, focusedAnnotationId, onAnnotationClick }: AnnotationListProps) => {
  return (
    <div className="h-32 border overflow-y-auto bg-white rounded-lg">
      <div className="p-2">
        <h3 className="font-semibold mb-2">Annotations</h3>
        <div className="space-y-2">
          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className={`p-2 rounded cursor-pointer transition-colors ${
                focusedAnnotationId === annotation.id
                  ? 'bg-yellow-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onAnnotationClick(annotation)}
              onKeyUp={()=> onAnnotationClick(annotation)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: annotation.color }}
                />
                <div className="flex-grow">
                  <div className="text-sm">
                    {annotation.comment || 'No comment'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Page {annotation.pageNumber}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export interface TooltipContentProps {
  annotation: Annotation;
  onClose: () => void;
}

export const TooltipContent = ({ annotation, onClose }: TooltipContentProps) => {
  const { updateAnnotation, deleteAnnotation } = useAnnotationActions(annotation.documentId);
  const [comment, setComment] = useState(annotation.comment || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveComment = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateAnnotation(annotation.id, { comment });
    setIsEditing(false);
    onClose?.();
  }, [annotation.id, comment, updateAnnotation, onClose]);

  const handleColorChange = useCallback((e: React.MouseEvent, color: string) => {
    e.stopPropagation();
    updateAnnotation(annotation.id, { color });
    onClose?.();
  }, [annotation.id, updateAnnotation, onClose]);

  const handleStartEditing = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAnnotation(annotation.id);
    onClose?.();
  }, [annotation.id, deleteAnnotation, onClose]);

  const colors = [
    "rgba(255, 255, 0, 0.3)", // Yellow
    "rgba(0, 255, 0, 0.3)", // Green
    "rgba(255, 182, 193, 0.3)", // Pink
    "rgba(135, 206, 235, 0.3)", // Sky Blue
  ];

  const handleTooltipClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="flex flex-col gap-2" onClick={handleTooltipClick} onKeyUp={() => handleTooltipClick}>
      {/* Color picker and delete button */}
      <div className="flex items-center justify-center gap-2">
          {colors.map((color) => (
            <button
              type="button"
              title="color"
              key={color}
              className={'w-6 h-6 rounded'}
              style={{ backgroundColor: color }}
              onClick={(e) => handleColorChange(e, color)}
            />
          ))}
      </div>

      {/* Comment section */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border rounded p-2 text-sm"
            placeholder="Add a comment..."
            rows={3}
            onClick={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveComment}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2">
          {annotation.comment ? (
            <>
              <div className="text-sm text-gray-700">{annotation.comment}</div>
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-500 hover:text-red-600"
          >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStartEditing}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Add comment
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};