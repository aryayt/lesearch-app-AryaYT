import { useState } from "react";
import type { Annotation } from "@/anaralabs/lector";
import { useAnnotationActions } from "./useAnnotationActions";

interface DefaultAnnotationTooltipProps {
  annotation: Annotation;
  onClose?: () => void;
}

export const DefaultAnnotationTooltip = ({
  annotation,
  onClose,
}: DefaultAnnotationTooltipProps) => {
  const [comment, setComment] = useState(annotation.comment || "");
  const [isEditing, setIsEditing] = useState(false);
  const { updateAnnotation } = useAnnotationActions(annotation.documentId);

  const handleSaveComment = () => {
    updateAnnotation(annotation.id, { comment });
    setIsEditing(false);
    onClose?.();
  };

  const handleColorChange = (color: string) => {
    updateAnnotation(annotation.id, { color });
    onClose?.();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    onClose?.();
  };

  const colors = [
    "rgba(255, 255, 0, 0.3)", // Yellow
    "rgba(0, 255, 0, 0.3)", // Green
    "rgba(255, 182, 193, 0.3)", // Pink
    "rgba(135, 206, 235, 0.3)", // Sky Blue
  ];

  return (
    <div className="flex flex-col gap-2">
      {isEditing ? (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Add a comment..."
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveComment}
              className="px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded"
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            {colors.map((color) => (
              <button
                type="button"
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              {comment ? "Edit" : "Add"} Comment
            </button>
          </div>
          {comment && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-sm">{comment}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 