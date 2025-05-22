import React, { useEffect } from 'react'
import Editor from './editor'
import { useDocStore } from '@/store/useDocStore'
import { useDocRealtime } from '@/store/use-doc-realtime'
import GridLoader from '../loader/grid-loader'
import { useTheme } from 'next-themes'


const BlockEditor = ({ docid }: { docid: string }) => {
  const { docs, loadingDocs, updateDocAsync, getDocAsync, clearDoc } = useDocStore();
  const doc = docs[docid];
  const isInitialLoading = loadingDocs[docid];
  const { resolvedTheme } = useTheme();

  useDocRealtime();

  useEffect(() => {
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

  return (
    <Editor 
      onChange={(content: string) => updateDocAsync(docid, { content })}
      initialContent={doc?.content || ''}
    />
  )
}


export default BlockEditor