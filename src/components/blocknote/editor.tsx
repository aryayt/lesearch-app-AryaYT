import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useCallback, useMemo, useState } from "react";
import type { Block } from "@blocknote/core";
import { toast } from "sonner";
import debounce from "lodash/debounce";

interface EditorProps {
  onChange: (content: string) => Promise<void>;
  initialContent: string;
}

const Editor: React.FC<EditorProps> = ({ onChange, initialContent }) => {
  // Parse initial content if it exists
  const parsedContent = initialContent
    ? (JSON.parse(initialContent) as Block[])
    : undefined;

  // Creates a new editor instance with initial content
  const editor = useCreateBlockNote({
    initialContent: parsedContent,
  });

  const { resolvedTheme } = useTheme();
  const [stats, setStats] = useState({ characters: 0, words: 0, tokens: 0 });

  const updateContent = useCallback(
    async (content: string) => {
      try {
        if (onChange) await onChange(content);
      } catch (error) {
        console.error("Failed to save changes:", error);
        toast.error("Failed to save changes");
      }
    },
    [onChange]
  );

  const debouncedUpdate = useMemo(
    () => debounce(updateContent, 1000),
    [updateContent]
  );

  const updateStatsFromEditor = useCallback(() => {
    if (editor?.domElement) {
      const plainText = editor.domElement.innerText || "";
      const characters = plainText.length;
      const words = plainText.split(/\s+/).filter(Boolean).length;
      // Simple token estimation (not perfect but gives a rough idea)
      const tokens = Math.ceil(characters / 4);
      setStats({ characters, words, tokens });
    }
  }, [editor]);

  const handleEditorChange = useCallback(() => {
    try {
      const blocks = editor.document;
      debouncedUpdate(JSON.stringify(blocks));
      updateStatsFromEditor(); // Update stats on change
    } catch (error) {
      console.error("Error handling editor change:", error);
      toast.error("Failed to process changes");
    }
  }, [editor, debouncedUpdate, updateStatsFromEditor]);

  useEffect(() => {
    // Initial stats calculation when editor is ready
    updateStatsFromEditor();
  }, [updateStatsFromEditor]);

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  // Renders the editor instance using a React component.
  return (
    <div className="flex flex-col h-full w-full">
      <BlockNoteView
        editor={editor}
        onChange={handleEditorChange}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        data-theming-css-variables
        className="flex-grow"
      />
      <div className="flex items-center justify-end p-1 px-3 text-xs text-muted-foreground border-t bg-background space-x-3">
        <span>Chars: {stats.characters}</span>
        <span>Words: {stats.words}</span>
        <span>Tokens: {stats.tokens}</span>
      </div>
    </div>
  );
};

export default Editor;
