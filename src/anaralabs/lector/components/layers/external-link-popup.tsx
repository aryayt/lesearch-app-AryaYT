import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XIcon, Minimize2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLayoutStore } from "@/store/layoutStore";
import { useEffectOnce } from "react-use";

interface ExternalLinkPopupProps {
  url: string;
  onClose: () => void;
  onNavigate: () => void;
}

export const ExternalLinkPopup = ({ url, onClose, onNavigate }: ExternalLinkPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popupPosition, setPopupPosition] = useState({
    top: window.innerHeight / 2 - 100,
    left: window.innerWidth / 2 - 200,
  });
  const { showExternalLink, setShowExternalLink } = useLayoutStore();

  // Adjust position to keep popup within window bounds
  const adjustPosition = () => {
    if (!popupRef.current) return;

    const rect = popupRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const newPosition = { ...popupPosition };

    // Adjust horizontally if needed
    if (popupPosition.left + rect.width > windowWidth) {
      newPosition.left = Math.max(0, windowWidth - rect.width);
    }

    // Adjust vertically if needed
    if (popupPosition.top + rect.height > windowHeight) {
      newPosition.top = Math.max(0, windowHeight - rect.height);
    }

    setPopupPosition(newPosition);
  };

  // Handle initial positioning and window resize
  useEffectOnce(() => {
    adjustPosition();

    const handleResize = () => {
      adjustPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }); // Empty dependency array since we only want this to run on mount

  // Handle drag event handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        left: e.clientX - dragOffset.x,
        top: e.clientY - dragOffset.y,
      };

      // Keep within window bounds while dragging
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const rect = popupRef.current?.getBoundingClientRect();

      if (rect) {
        if (newPosition.left < 0) newPosition.left = 0;
        if (newPosition.top < 0) newPosition.top = 0;
        if (newPosition.left + rect.width > windowWidth) {
          newPosition.left = windowWidth - rect.width;
        }
        if (newPosition.top + rect.height > windowHeight) {
          newPosition.top = windowHeight - rect.height;
        }
      }

      setPopupPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isHeader = target.closest("h3") !== null || target.classList.contains("drag-handle");

    if (!isHeader) return;

    const rect = popupRef.current?.getBoundingClientRect();
    if (!rect) return;

    e.preventDefault();

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setIsDragging(true);
  };

  const handleMinimize = () => {
    setShowExternalLink(false);
  };

  if (!showExternalLink) return null;

  return (
    <div
      ref={popupRef}
      className="fixed bg-card rounded-lg shadow-lg z-50"
      style={{
        position: "fixed",
        top: popupPosition.top,
        left: popupPosition.left,
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        transition: "all 0.2s ease-in-out",
        transformOrigin: "center",
        animation: "0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        userSelect: isDragging ? "none" : "auto",
        width: "400px",
      }}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
          <div
            className={`flex items-center justify-between w-full border-b border-border ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            onMouseDown={handleMouseDown}
          >
            <h3 className="drag-handle flex-1 px-4 py-2 text-lg font-semibold">
              External Link
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMinimize}
                className="h-8 w-8 rounded-full hover:bg-muted/80"
              >
                <Minimize2Icon className="h-4 w-4" />
                <span className="sr-only">Minimize</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-muted/80"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="p-3 rounded-md bg-muted/50 dark:bg-muted/20 text-foreground break-all text-sm">
            {url}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-4 pt-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={onNavigate}
            className="h-9"
          >
            Go to Link
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
