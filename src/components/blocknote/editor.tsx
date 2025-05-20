import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "next-themes";
export default function Editor() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote();
  const { resolvedTheme } = useTheme();
 
  // Renders the editor instance using a React component.
  return <BlockNoteView editor={editor} theme={resolvedTheme === "dark" ? "dark" : "light"} data-theming-css-variables/>;
}
 