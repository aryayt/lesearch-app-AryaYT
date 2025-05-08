# Coding Standards

## Overview

This document outlines the coding standards and best practices for the Lesearch project. Following these guidelines ensures consistency, maintainability, and high quality across the codebase.

## TypeScript

- Use TypeScript for all new code
- Enable strict mode in tsconfig.json
- Define explicit types for function parameters and return values
- Use interfaces for object shapes and types for unions/primitives
- Avoid using `any` type; use `unknown` when type is truly unknown
- Use type guards to narrow types when necessary

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
  metadata: Record<string, unknown>;
}

function getUserName(user: User): string {
  return user.name;
}

// Avoid
function processData(data: any): any {
  return data.something;
}
```

## React Components

- Use functional components with hooks
- Use named exports for components
- Place components in appropriate directories based on their scope
- Use proper prop typing with TypeScript
- Implement proper error boundaries
- Use React.memo() for performance optimization when appropriate

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export function Button({ 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`} 
      onClick={onClick} 
      disabled={disabled}
    >
      {label}
    </button>
  );
}
```

## Next.js

- Use the App Router for all new routes
- Follow the Next.js file-based routing conventions
- Use server components where possible for better performance
- Properly use client components with "use client" directive when needed
- Implement proper loading and error states
- Use Next.js Image component for optimized images
- Use Next.js Link component for client-side navigation

```typescript
// Good - Server Component
export default async function Page({ params }: { params: { id: string } }) {
  const data = await fetchData(params.id);
  return <DataDisplay data={data} />;
}

// Good - Client Component
"use client";

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## State Management

- Use Zustand for global state management
- Use React hooks (useState, useReducer) for component-local state
- Keep state minimal and derive values when possible
- Use proper state initialization
- Implement proper state persistence when needed

```typescript
// Good
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

## Styling

- Use Tailwind CSS for styling
- Follow the shadcn/ui component patterns
- Use CSS variables for theming
- Implement responsive design using Tailwind breakpoints
- Use consistent naming conventions for custom classes

```typescript
// Good
<div className="flex flex-col md:flex-row items-center justify-between p-4 gap-2">
  <h1 className="text-2xl font-bold text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

## File Structure

- Organize files by feature/module
- Keep components focused and small
- Use index files for cleaner imports
- Use consistent file naming conventions
- Separate UI components from logic/hooks

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── _components/
│   │   │   └── sidebar/
│   │   │       └── app-sidebar.tsx
│   │   └── (routes)/
│   │       └── documents/
│   │           └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── input.tsx
│   └── shared/
│       └── logo.tsx
├── hooks/
│   └── use-debounce.ts
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── middleware.ts
└── store/
    └── user-store.ts
```

## Error Handling

- Implement proper error boundaries in React components
- Use try/catch blocks for async operations
- Provide meaningful error messages
- Log errors appropriately
- Handle edge cases and null/undefined values

```typescript
// Good
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}
```

## Testing

- Write unit tests for critical functionality
- Use React Testing Library for component tests
- Implement integration tests for key user flows
- Use mock services for external dependencies
- Maintain good test coverage

```typescript
// Good
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Performance

- Implement proper memoization (useMemo, useCallback)
- Optimize rendering with React.memo
- Use proper key props in lists
- Implement code splitting and lazy loading
- Optimize images and assets
- Use proper caching strategies

```typescript
// Good
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data, onItemClick }) {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);
  
  const handleItemClick = useCallback((id) => {
    onItemClick(id);
  }, [onItemClick]);
  
  return (
    <ul>
      {processedData.map(item => (
        <li key={item.id} onClick={() => handleItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## Accessibility

- Ensure all components are accessible
- Use proper ARIA attributes
- Implement keyboard navigation
- Ensure sufficient color contrast
- Test with screen readers
- Follow WCAG guidelines

```typescript
// Good
<button
  aria-label="Close dialog"
  onClick={onClose}
  className="focus:ring-2 focus:ring-primary"
>
  <span className="sr-only">Close</span>
  <XIcon />
</button>
```

## Code Comments

- Write meaningful comments for complex logic
- Document public APIs and functions
- Use JSDoc for function documentation
- Keep comments up-to-date with code changes
- Don't comment obvious code

```typescript
/**
 * Fetches user data from the API
 * @param userId - The ID of the user to fetch
 * @returns Promise resolving to user data
 * @throws Error if user not found or network failure
 */
async function fetchUser(userId: string): Promise<User> {
  // Implementation...
}
```

## Commit Guidelines

- Write clear, concise commit messages
- Use conventional commits format (feat, fix, docs, etc.)
- Reference issue numbers when applicable
- Keep commits focused and atomic
- Run linters before committing

```
feat(auth): implement Google OAuth sign-in
fix(dashboard): resolve panel resize issue on mobile
docs: update README with setup instructions
```
