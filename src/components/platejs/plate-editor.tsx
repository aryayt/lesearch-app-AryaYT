'use client';

import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { ParagraphPlugin, Plate } from '@udecode/plate/react';
import type { Value } from '@udecode/plate';

import { useCreateEditor } from '@/components/platejs/use-create-editor';
import { SettingsDialog } from '@/components/platejs/settings';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { useDocStore } from '@/store/useDocStore';
import { useDocRealtime } from '@/store/use-doc-realtime'
import GridLoader from '../loader/grid-loader'
import { useTheme } from 'next-themes';

export function PlateEditor({ docid }: { docid: string }) {
  const { docs, loadingDocs, getDocAsync, clearDoc, updateDocAsync } = useDocStore();
  const doc = docs[docid];
  const isInitialLoading = loadingDocs[docid];
  const { resolvedTheme } = useTheme();
  
  const initialValue: Value = [
    {
      children: [{ text: 'Playground' }],
      type: 'h1',
    },
    {
      children: [
        { text: 'A rich-text editor with AI capabilities. Try the ' },
        { bold: true, text: 'AI commands' },
        { text: ' or use ' },
        { kbd: true, text: 'Cmd+J' },
        { text: ' to open the AI menu.' },
      ],
      type: ParagraphPlugin.key,
    },
  ];

  const editor = useCreateEditor({ 
    value: doc?.content ? JSON.parse(doc.content) : initialValue 
  });

  useDocRealtime();

  React.useEffect(() => {
    getDocAsync(docid);
    
    // Cleanup when component unmounts or docid changes
    return () => {
      clearDoc(docid);
    };
  }, [docid, getDocAsync, clearDoc]);

  // Only show loading skeleton on initial fetch
  if (isInitialLoading && !doc) {
    return (
      <div className="h-full w-full flex justify-center items-center">
      <GridLoader size="80" color={`${resolvedTheme==="light"?'#000000':'#ffffff'}`} />
    </div>
    );
  }

  const handleChange = (options: { value: Value }) => {
    console.log('Editor content changed:', options.value);
    updateDocAsync(docid, { content: JSON.stringify(options.value) });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor} onChange={handleChange}>
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>
        <SettingsDialog />
      </Plate>
    </DndProvider>
  );
}
