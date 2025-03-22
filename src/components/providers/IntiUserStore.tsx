"use client";

import { useEffect } from 'react';
import { initUserStore } from '@/store/userStore';

export function StoreInitializer() {
  useEffect(() => {
    // Initialize the user store and set up auth listeners
    const unsubscribe = initUserStore();
    
    // Cleanup function for React strict mode
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return null;
}