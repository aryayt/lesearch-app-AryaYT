'use client';

import { useEffect } from 'react';
import { useAPIKeyStore } from '@/store/apiKeyStore';

export function APIKeyProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAPIKeyStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
} 