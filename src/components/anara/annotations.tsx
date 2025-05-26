import type { Annotation } from "@/anaralabs/lector";
import { useCallback, useState } from "react";
import { useAnnotationActions } from "./useAnnotationActions";
import { ToolbarGroup } from "@/components/ui/toolbar";
import { MessageSquareMore, MessageSquarePlusIcon, Trash2Icon } from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const colors = [
  "rgba(255, 255, 0, 0.3)", // Yellow
  "rgba(0, 255, 0, 0.3)", // Green
  "rgba(255, 182, 193, 0.3)", // Pink
  "rgba(135, 206, 235, 0.3)", // Sky Blue
];

interface SelectionTooltipContentProps {
  onHighlight: (color: string) => void;
  onAskAI: () => void;
}

export const SelectionTooltipContent = ({ onHighlight, onAskAI }: SelectionTooltipContentProps) => {
  return (
    <ToolbarGroup>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAskAI}
        className="gap-2"
      >
        <svg fill="url(#myGradient)" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="size-4" aria-hidden="true">
          <defs><linearGradient id="myGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#6EB6F2" />
            <stop offset="15%" stopColor="#6EB6F2" />
            <stop offset="40%" stopColor="#c084fc" />
            <stop offset="60%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient></defs>
          <path d="M161.15 362.26a40.902 40.902 0 0 0 23.78 7.52v-.11a40.989 40.989 0 0 0 37.75-24.8l17.43-53.02a81.642 81.642 0 0 1 51.68-51.53l50.57-16.44a41.051 41.051 0 0 0 20.11-15.31 40.964 40.964 0 0 0 7.32-24.19 41.077 41.077 0 0 0-8.23-23.89 41.051 41.051 0 0 0-20.68-14.54l-49.92-16.21a81.854 81.854 0 0 1-51.82-51.85L222.7 27.33A41.11 41.11 0 0 0 183.63.01c-8.54.07-16.86 2.8-23.78 7.81A41.152 41.152 0 0 0 145 27.97l-16.58 50.97c-4 11.73-10.61 22.39-19.33 31.19s-19.33 15.5-31.01 19.61l-50.54 16.24a41.131 41.131 0 0 0-15.89 10.14 41.059 41.059 0 0 0-9.69 16.17 41.144 41.144 0 0 0-1.44 18.8c.98 6.29 3.42 12.27 7.11 17.46a41.312 41.312 0 0 0 20.39 15.19l49.89 16.18a82.099 82.099 0 0 1 32.11 19.91c2.42 2.4 4.68 4.96 6.77 7.65a81.567 81.567 0 0 1 12.94 24.38l16.44 50.49a40.815 40.815 0 0 0 14.98 19.91zm218.06 143.57c-5.42-3.86-9.5-9.32-11.66-15.61l-9.33-28.64a37.283 37.283 0 0 0-8.9-14.48c-4.05-4.06-9-7.12-14.45-8.93l-28.19-9.19a32.655 32.655 0 0 1-16.24-12.06 32.062 32.062 0 0 1-5.97-18.74c.01-6.76 2.13-13.35 6.06-18.86 3.91-5.53 9.46-9.68 15.87-11.86l28.61-9.27a37.013 37.013 0 0 0 14.08-9.01c3.95-4.04 6.91-8.93 8.67-14.29l9.22-28.22a32.442 32.442 0 0 1 11.72-15.87 32.476 32.476 0 0 1 18.74-6.17c6.74-.07 13.33 1.96 18.86 5.81 5.53 3.84 9.74 9.31 12.03 15.64l9.36 28.84a36.832 36.832 0 0 0 8.94 14.34c4.05 4.03 8.97 7.06 14.39 8.87l28.22 9.19a32.44 32.44 0 0 1 16.29 11.52 32.465 32.465 0 0 1 6.47 18.87 32.458 32.458 0 0 1-21.65 31.19l-28.84 9.36a37.384 37.384 0 0 0-14.36 8.93c-4.05 4.06-7.1 9.01-8.9 14.45l-9.16 28.13A32.492 32.492 0 0 1 417 505.98a32.005 32.005 0 0 1-18.74 6.03 32.508 32.508 0 0 1-19.05-6.18z" />
        </svg>
        <span style={{ background: "linear-gradient(to bottom right, #6EB6F2 0%, #6EB6F2 15%, #c084fc 40%, #f87171 60%, #fcd34d 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Ask AI
        </span>
      </Button>
      <Separator orientation="vertical" />
      <div className="flex flex-row gap-1">
        {colors.map((color) => (
          <Button
            key={color}
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => onHighlight(color)}
          >
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
          </Button>
        ))}
      </div>
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

export interface AnnotationTooltipProps {
  annotation: Annotation;
  onClose: () => void;
}

export const AnnotationTooltip = ({ annotation, onClose }: AnnotationTooltipProps) => {
  const { updateAnnotation, deleteAnnotation } = useAnnotationActions(annotation.documentId);
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(annotation.comment || "");

  const handleColorChange = useCallback((e: React.MouseEvent, color: string) => {
    e.stopPropagation();
    updateAnnotation(annotation.id, { color });
    onClose?.();
  }, [annotation.id, updateAnnotation, onClose]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAnnotation(annotation.id);
    onClose?.();
  }, [annotation.id, deleteAnnotation, onClose]);

  const handleSaveComment = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateAnnotation(annotation.id, { comment });
    setIsEditing(false);
    onClose?.();
  }, [annotation.id, comment, updateAnnotation, onClose]);

  const handleDeleteComment = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateAnnotation(annotation.id, { comment: "" });
    setIsEditing(false);
    onClose?.();
  }, [annotation.id, updateAnnotation, onClose]);

  const handleTooltipClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div 
      className="flex flex-col gap-3" 
      onClick={handleTooltipClick}
      onKeyUp={handleTooltipClick}
    >
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              {annotation.comment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteComment}
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveComment}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {colors.map((color) => (
                <Button
                  key={color}
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-muted"
                  onClick={(e) => handleColorChange(e, color)}
                >
                  <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: color }} />
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2Icon className="size-4" />
            </Button>
            {annotation.comment ?<Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:bg-muted"
            >
              <MessageSquareMore className="size-4" />
            </Button> : <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:bg-muted"
            >
              <MessageSquarePlusIcon className="size-4" />
            </Button>}
          </div> 
        </>
      )}
    </div>
  );
};