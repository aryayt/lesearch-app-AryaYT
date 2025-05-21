import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "next-themes";
import type React from 'react';
import { useEffect, useCallback, useMemo } from 'react';
import type { Block } from "@blocknote/core";
import { toast } from "sonner";
import debounce from "lodash/debounce";

interface EditorProps {
  onChange: (content: string) => Promise<void>;
  initialContent: string;
}

const Editor: React.FC<EditorProps> = ({ onChange, initialContent }) => {
  // Parse initial content if it exists
  const parsedContent = initialContent ? JSON.parse(initialContent) as Block[] : undefined;

  // Creates a new editor instance with initial content
  const editor = useCreateBlockNote({
    initialContent: parsedContent,
  });

  const { resolvedTheme } = useTheme();


  const updateContent = useCallback(
    async (content: string) => {
      try {
        if (onChange) await onChange(content);
      } catch (error) {
        console.error("Failed to save changes:", error);
        toast.error("Failed to save changes");
      }
    },
    [onChange],
  );

  const debouncedUpdate = useMemo(
    () => debounce(updateContent, 1000),
    [updateContent],
  );

  const handleEditorChange = useCallback(() => {
    try {
      const blocks = editor.document;
      debouncedUpdate(JSON.stringify(blocks));
    } catch (error) {
      console.error("Error handling editor change:", error);
      toast.error("Failed to process changes");
    }
  }, [editor, debouncedUpdate]);

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  // Renders the editor instance using a React component.
  return (
    <BlockNoteView 
      editor={editor} 
      onChange={handleEditorChange}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      data-theming-css-variables
    />
  );
};

export default Editor;
 