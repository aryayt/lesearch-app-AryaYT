# State Management Documentation

## Overview

Lesearch uses Zustand for state management, a lightweight state management library that provides a simple and flexible API. The application primarily uses Zustand with the persist middleware to maintain state across page reloads and browser sessions.

## User Store

The main state store is the `userStore` located in `src/store/userStore.ts`. This store manages user authentication state and profile data.

### Key Features

- **Persistence**: User data is persisted in localStorage using Zustand's persist middleware
- **Selective Persistence**: Only essential user data is persisted to avoid storage bloat
- **Stale Data Handling**: Implements a mechanism to detect and refresh stale data
- **Authentication State**: Tracks user authentication status and profile information
- **Error Handling**: Manages authentication errors and loading states

### Store Structure

```typescript
interface UserState {
  user: User | null;
  email: string | null;
  firstname: string | null;
  fullname: string | null;
  image: string | null;
  userLoading: boolean;
  userError: string | null;
  initialized: boolean;
  lastUpdated: number | null;
  
  // Actions
  fetchUser: () => Promise<void>;
  clearUser: () => void;
  isDataStale: () => boolean;
  signOutAsync: (scope?: "local" | "global" | "others") => Promise<void>;
}
```

### Key Methods

- **fetchUser**: Retrieves the current user from Supabase and updates the store
- **clearUser**: Clears user data from the store (used during sign-out)
- **isDataStale**: Checks if the stored user data is stale and needs refreshing
- **signOutAsync**: Handles user sign-out with different scopes (local, global, others)

### Initialization

The user store is initialized in the application through the `initUserStore` function, which:

1. Sets up a Supabase auth state change listener
2. Updates the store when authentication events occur (sign-in, sign-out, user updates)
3. Checks for stale data on initial load and refreshes if necessary

## Known Issues and Solutions

### Rehydration with Client-Side Navigation

**Issue**: When using Next.js client-side navigation (router.push()), the Zustand store may not properly rehydrate from localStorage, causing UI elements to be unresponsive.

**Solution**: Use `window.location.href` instead of `router.push()` for critical navigation paths that require a full page reload to ensure proper rehydration of the Zustand store. This is particularly important when redirecting from the complete profile page to the documents page.

```typescript
// Instead of this:
router.push('/documents');

// Use this for critical navigation paths:
window.location.href = '/documents';
```

## Best Practices

1. **Selective Persistence**: Only persist essential data to avoid storage bloat
   ```typescript
   partialize: (state) => ({ 
     user: state.user,
     initialized: state.initialized,
     lastUpdated: state.lastUpdated
   })
   ```

2. **Stale Data Handling**: Implement mechanisms to detect and refresh stale data
   ```typescript
   isDataStale: () => {
     const lastUpdated = get().lastUpdated;
     if (!lastUpdated) return true;
     
     const now = Date.now();
     return (now - lastUpdated) > STALE_TIME;
   }
   ```

3. **Error Handling**: Properly manage and display authentication errors
   ```typescript
   try {
     // Authentication logic
   } catch (error) {
     set({ 
       userError: error instanceof Error ? error.message : 'Authentication error',
       userLoading: false
     });
   }
   ```

4. **Loading States**: Track loading states to provide feedback to users
   ```typescript
   set({ userLoading: true });
   try {
     // Async operation
     set({ userLoading: false });
   } catch (error) {
     set({ userLoading: false });
   }
   ```

## Future Enhancements

- **Document Store**: Implement a store for managing document state and metadata
- **Preferences Store**: Create a store for user preferences and application settings
- **AI Chat Store**: Develop a store for managing AI chat history and context
- **Optimistic Updates**: Implement optimistic updates for better user experience
