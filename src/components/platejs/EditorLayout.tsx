import React from 'react';
import { useDocStore } from '@/store/useDocStore';
import { useDocRealtime } from '@/store/use-doc-realtime';
import { PlateEditor } from './plate-editor';
import GridLoader from '../loader/grid-loader';
import { useTheme } from 'next-themes';
import type { Value } from '@udecode/plate';

const EditorLayout = ({ docid }: { docid: string }) => {
  const { docs, loadingDocs, getDocAsync, clearDoc } = useDocStore();
  const doc = docs[docid];
  const isInitialLoading = loadingDocs[docid];
  const { resolvedTheme } = useTheme();


  useDocRealtime();

  React.useEffect(() => {
    console.log('Fetching doc:', docid);
    getDocAsync(docid);
    
    return () => {
      console.log('Cleaning up doc:', docid);
      clearDoc(docid);
    };
  }, [docid, getDocAsync, clearDoc]);

  // Show loading skeleton on initial fetch
  if (isInitialLoading && !doc) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <GridLoader size="80" color={`${resolvedTheme==="light"?'#000000':'#ffffff'}`} />
      </div>
    );
  }

     // Set initial value based on whether doc has been loaded
     const initialValue: Value = doc?.content ? JSON.parse(doc.content) : [];


  return (
    <div data-registry="plate" className="flex flex-col gap-2 h-full">
      {doc?.content !== undefined && <PlateEditor docid={docid} content={initialValue} />}
    </div>
  )
};

export default EditorLayout;