import type { Annotation } from "@/anaralabs/lector";
import { useCallback, useState } from "react";
import { useAnnotationActions } from "./useAnnotationActions";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface CommentDialogProps {
  annotation: Annotation;
  onClose: () => void;
}

export default function CommentDialog({ annotation, onClose }: CommentDialogProps) {
  const { updateAnnotation, deleteAnnotation } = useAnnotationActions(annotation.documentId);
  const [comment, setComment] = useState(annotation.comment || "");

  const handleSaveComment = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateAnnotation(annotation.id, { comment });
    onClose?.();
  }, [annotation.id, comment, updateAnnotation, onClose]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAnnotation(annotation.id);
    onClose?.();
  }, [annotation.id, deleteAnnotation, onClose]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg min-w-[300px]">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="min-h-[100px]"
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={onClose}
        >
          Cancel
        </Button>
        {annotation.comment && (
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
        <Button
          variant="default"
          onClick={handleSaveComment}
        >
          Save
        </Button>
      </div>
    </div>
  );
} 