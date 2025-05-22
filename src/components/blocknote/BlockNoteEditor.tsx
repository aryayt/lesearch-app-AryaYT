import React, { useEffect, useState } from 'react'
import Editor from './editor'
import { useDocStore } from '@/store/useDocStore'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocRealtime } from '@/store/use-doc-realtime'
const BlockEditor = ({ docid }: { docid: string }) => {
  const { doc, updateDocAsync, getDocAsync } = useDocStore();
  const [loading, setLoading] = useState(true);
  useDocRealtime();
  useEffect(() => {
    getDocAsync(docid);
    setLoading(false);
  }, [docid, getDocAsync]);

  if (loading) {
    return <DocumentSkeleton />;
  }

  return (
    <Editor 
      onChange={(content: string) => updateDocAsync(docid, { content })}
      initialContent={doc?.content || ''}
    />
  )
}

function DocumentSkeleton() {
    return (
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
    );
  }

export default BlockEditor