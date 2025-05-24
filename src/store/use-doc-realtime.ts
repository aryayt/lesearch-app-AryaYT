import { createClient } from '@/lib/supabase/client';
import { useEffectOnce } from 'react-use';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useDocStore } from './useDocStore';

interface Doc {
  id: string;
  content: string | null;
  uuid: string;
}

type DocPayload = RealtimePostgresChangesPayload<Doc> & {
  doc: Doc;
  old: { id: string; uuid: string };
};

export const useDocRealtime = () => {
  const { docRealtimeHandler } = useDocStore();

  useEffectOnce(() => {
    console.log('Setting up realtime subscription');
    const supabase = createClient();
    const channel = supabase
      .channel("notes_content")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        (payload) => {
          console.log('Realtime event received:', payload);
          docRealtimeHandler(payload as DocPayload);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      channel.unsubscribe();
    };
  });
}; 