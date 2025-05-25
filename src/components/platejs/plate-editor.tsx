'use client';

import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plate } from '@udecode/plate/react';
import type { Value } from '@udecode/plate';
import { useCreateEditor } from '@/components/platejs/use-create-editor';
// import { SettingsDialog } from '@/components/platejs/settings';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { useDocStore } from '@/store/useDocStore';
import { useCallback } from 'react';
import debounce from 'lodash/debounce';

export function PlateEditor({ docid , content}: { docid: string , content: Value }) {
  const { updateDocAsync } = useDocStore();
 

  const debouncedUpdate = useCallback((value: Value) => {
    updateDocAsync(docid, { content: JSON.stringify(value) });
  }, [docid, updateDocAsync]);

  const debouncedSave = debounce(debouncedUpdate, 1500);

  


  const editor = useCreateEditor({ value: content });
  

  // // Only show loading skeleton on initial fetch
  // if (isInitialLoading && !doc) {
  //   return (
  //     <div className="h-full w-full flex justify-center items-center">
  //       <GridLoader size="80" color={`${resolvedTheme==="light"?'#000000':'#ffffff'}`} />
  //     </div>
  //   );
  // }

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate 
        editor={editor} 
        onChange={(options: { value: Value }) => debouncedSave(options.value)}
      >
        <EditorContainer>
          <Editor variant="default" />
        </EditorContainer>
        {/* <SettingsDialog /> */}
      </Plate>
    </DndProvider>
  );
}
