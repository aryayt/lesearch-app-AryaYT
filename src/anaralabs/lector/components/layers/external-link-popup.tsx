import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XIcon, Minimize2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLayoutStore } from "@/store/layoutStore";
import { useEffectOnce } from "react-use";
import type { Components } from "react-markdown";
import type { HTMLProps, DetailedHTMLProps, OlHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";


interface ExternalLinkPopupProps {
  url: string;
  onClose: () => void;
  onNavigate: () => void;
}

export const ExternalLinkPopup = ({ url, onClose, onNavigate }: ExternalLinkPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popupPosition, setPopupPosition] = useState({
    top: window.innerHeight / 2 - 100,
    left: window.innerWidth / 2 - 200,
  });
  const { showExternalLink, setShowExternalLink } = useLayoutStore();
  const animationFrameRef = useRef<number>(0);

   // Fetch context from API
   useEffect(() => {
    const fetchContext = async () => {
      try {
        setIsLoading(true);
        const title = url.split("/").pop() || ""; // get the title from the url
        const response = await fetch(
          `/api/citation-summary?mainpaperId=${encodeURIComponent(url)}&citationTitle=${encodeURIComponent(title)}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setContext(data.summary || "");
        setIsLoading(false);
      } catch (error) {
        console.log("Error fetching citation summary:", error);
        setError("Unable to fetch paper");
        // setContext(`# Heading 1\n\n## Heading 2\n\n### Heading 3\n\nThis is a paragraph with some **bold text** and some *italic text*.\n\n> This is a blockquote.\n\n[This is a link](https://example.com)\n\n- List item 1\n- List item 2\n- List item 3\n\n1. Ordered item 1\n2. Ordered item 2\n3. Ordered item 3\n\n\`\`\`js\nconsole.log('This is a code block!');\n\`\`\`\n`);
        setIsLoading(false);
      }
    };

    fetchContext();
  }, [url]);

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
  });

  // Handle drag event handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
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
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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

  const components: Components = {
    h1: ({ ...props }: HTMLProps<HTMLHeadingElement>) => (
      <div>
        <h1
          className="text-2xl font-bold text-foreground border-b border-border pb-1 mt-4 mb-3"
          {...props}
        />
      </div>
    ),
    h2: ({ ...props }: HTMLProps<HTMLHeadingElement>) => (
      <div>
        <h2
          className="text-xl font-bold text-foreground border-b border-border/50 pb-1 mt-3.5 mb-2.5"
          {...props}
        />
      </div>
    ),
    h3: ({ ...props }: HTMLProps<HTMLHeadingElement>) => (
      <div>
        <h3
          className="text-lg font-bold text-foreground pb-0.5 mt-3 mb-2"
          {...props}
        />
      </div>
    ),
    p: ({ ...props }: HTMLProps<HTMLParagraphElement>) => (
      <p className="leading-relaxed mb-2.5 text-foreground" {...props} />
    ),
    strong: ({ ...props }: HTMLProps<HTMLElement>) => (
      <strong className="font-bold text-foreground" {...props} />
    ),
    em: ({ ...props }: HTMLProps<HTMLElement>) => (
      <em className="italic text-foreground" {...props} />
    ),
    blockquote: ({ ...props }: HTMLProps<HTMLQuoteElement>) => (
      <blockquote
        className="border-l-3 border-muted pl-2.5 my-2.5 text-foreground/80 italic"
        {...props}
      />
    ),
    a: ({ ...props }: HTMLProps<HTMLAnchorElement>) => (
      <a
        className="text-blue-500 dark:text-blue-400 no-underline border-b border-dotted border-blue-500 dark:border-blue-400 transition-colors"
        {...props}
      />
    ),
    ul: ({ ...props }: HTMLProps<HTMLUListElement>) => (
      <ul className="list-disc ml-5 mb-2.5 text-foreground" {...props} />
    ),
    ol: ({
      ...props
    }: DetailedHTMLProps<
      OlHTMLAttributes<HTMLOListElement>,
      HTMLOListElement
    >) => (
      <ol className="list-decimal ml-5 mb-2.5 text-foreground" {...props} />
    ),
    li: ({ ...props }: HTMLProps<HTMLLIElement>) => (
      <li className="mb-1.5 text-foreground" {...props} />
    ),
  };

  return (
    <div
      ref={popupRef}
      className="fixed bg-card rounded-lg shadow-lg z-50"
      style={{
        position: "fixed",
        top: popupPosition.top,
        left: popupPosition.left,
        transition: isDragging ? "none" : "all 0.2s ease-in-out",
        willChange: "transform, top, left",
        userSelect: isDragging ? "none" : "auto",
        width: "400px",
      }}
    >
      <Card className="border-0 shadow-none gap-2">
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
        <CardContent className="p-2 h-72 flex">
          {isLoading ? (
            <div className="flex justify-center items-center h-full w-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : error ? (
            <p className="m-0 mb-4 text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border-l-3 border-red-600 dark:border-red-400 mx-4 mt-4">
              {error}
            </p> ) : (
        <div className="m-0 mb-4 max-h-64 overflow-y-auto border rounded-md bg-muted/50 dark:bg-muted/20 mx-4 mt-4 custom-markdown-container text-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            components={components}
          >
            {context}
          </ReactMarkdown>
        </div>
        )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-2 pt-0">
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
