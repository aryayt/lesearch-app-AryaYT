"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { createClient } from '@/lib/supabase/client';
import { signOut } from 'next-auth/react';

const Documents = () => {
  const { 
    user, 
    loading,
    error, 
    fetchUser, 
    updateUserData, 
    initialized,
    isDataStale,
    lastUpdated
  } = useUserStore();
  
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we need to fetch user data
    const checkAndFetchUser = async () => {
      try {
        // Fetch if not initialized or data is stale
        if (!initialized || isDataStale()) {
          await fetchUser();
        }
      } catch (error) {
        // console.error("Error fetching user data:", error);
        setAuthError(error instanceof Error ? error.message : "Authentication error");
      }
    };
    
    checkAndFetchUser();
  }, [initialized, fetchUser, isDataStale]);

  useEffect(() => {
    // If initialized and no user, redirect to login
    if (initialized && !loading && !user) {
      console.log("No user found, redirecting to login");
      router.push('/login');
    }
  }, [initialized, loading, user, router]);

  // Handle errors from the store
  useEffect(() => {
    if (error) {
      setAuthError(error);
      
      // If the error is about session expiration, redirect to login
      if (error.includes("session") || error.includes("expired")) {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    }
  }, [error, router]);

  const handleUpdateUser = async () => {
    try {
      setUpdateStatus("Updating...");
      setAuthError(null);
      
      await updateUserData({
        isLoggedin: "NotLogged",
        lastLoginAt: new Date().toISOString()
      });
      
      setUpdateStatus("User updated successfully!");
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setUpdateStatus(null);
      }, 3000);
      
    } catch (error) {
      // console.error('Error updating user:', error);
      setUpdateStatus(error instanceof Error ? `Update failed: ${error.message}` : 'Update failed');
      
      // If it's a session error, set auth error
      if (error instanceof Error && 
          (error.message.includes("session") || error.message.includes("missing"))) {
        setAuthError("Your session has expired. Please sign in again.");
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    }
  };

  const handleRefreshUser = async () => {
    try {
      setUpdateStatus("Refreshing user data...");
      setAuthError(null);
      
      await fetchUser();
      
      setUpdateStatus("User data refreshed!");
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setUpdateStatus(null);
      }, 3000);
    } catch (error) {
      // console.error('Error refreshing user:', error);
      setUpdateStatus("Failed to refresh user data");
      
      if (error instanceof Error && 
          (error.message.includes("session") || error.message.includes("missing"))) {
        setAuthError("Your session has expired. Please sign in again.");
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      setUpdateStatus("Signing out...");
      await signOut();
      const supabase = createClient();
      await supabase.auth.signOut();
      // The onAuthStateChange listener will handle clearing the store
      router.push('/login');
    } catch (error) {
      // console.error('Error signing out:', error);
      if(error)
      setUpdateStatus("Failed to sign out");
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-background/80 px-4 py-8 md:py-16 dark:bg-transparent">
  //       <div className="text-center">
  //         <h2 className="text-xl font-semibold">Loading...</h2>
  //         <p>Please wait while we fetch your information</p>
  //       </div>
  //     </div>
  //   );
  // }
  
  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background/80 px-4 py-8 md:py-16 dark:bg-transparent">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Authentication Error</h2>
          <p>{authError}</p>
          <button 
            type="button"
            onClick={() => router.push('/login')}
            className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background/80 px-4 py-8 md:py-16 dark:bg-transparent">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Documents</h1>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefreshUser}
            className="rounded bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/90 transition-colors"
            disabled={loading}
          >
            Refresh Data
          </button>
          
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 transition-colors"
            disabled={loading}
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {user && (
        <div className="space-y-6">
          <div className="rounded-lg bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">User Profile</h2>
              <button 
                type="button"
                onClick={handleUpdateUser}
                className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
                disabled={loading}
              >
                Update Login Status
              </button>
            </div>
            
            {updateStatus && (
              <div className={`mb-4 p-2 rounded ${updateStatus.includes('failed') ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                {updateStatus}
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdated ? 
                  new Date(lastUpdated).toLocaleString() : 
                  'Never'}
              </p>
            </div>
            
            <pre className="overflow-auto rounded bg-muted p-4 text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;