# Dependencies Guidelines

## Overview

This document provides guidelines for managing dependencies in the Lesearch project. When adding new packages or updating existing ones, please follow these guidelines to ensure compatibility with the current tech stack.

## Current Tech Stack Versions

- **React**: ^19.0.0
- **Next.js**: ^15.3.1
- **TypeScript**: ^5.x
- **Tailwind CSS**: ^4.x
- **shadcn/ui**: Latest components based on Radix UI
- **Supabase**: ^2.49.1
- **Zustand**: ^5.0.3

## Package Selection Guidelines

When selecting packages for the project, prioritize:

1. **Actively maintained** packages with regular updates
2. **TypeScript support** with proper type definitions
3. **Bundle size efficiency** to maintain good performance
4. **Accessibility compliance** for UI components
5. **Compatibility** with the current tech stack

## Version Constraints

When adding new dependencies, use the following version constraints:

- For core framework dependencies (React, Next.js), use the exact major version with caret (`^`) to allow minor updates
- For UI components and styling libraries, use compatible versions with the current Tailwind and shadcn/ui setup
- For utility libraries, use the latest stable versions

## Recommended Packages

### UI Components

- **Radix UI primitives**: Base accessible components
- **shadcn/ui**: Pre-styled components based on Radix UI
- **Embla Carousel**: For carousel/slider components
- **react-resizable-panels**: For resizable panel layouts

### State Management

- **Zustand**: Lightweight state management
- **TanStack Query**: Data fetching and caching

### Forms and Validation

- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### AI and NLP

- **@google/generative-ai**: Google Gemini API
- **@azure/openai**: Azure OpenAI API

### Document Processing

- **pdf.js**: PDF rendering and parsing
- **@blocknote/react**: Rich text editor
- **react-pdf**: PDF viewer component

## Adding New Dependencies

When adding new dependencies:

1. Check for compatibility with React 19 and Next.js 15
2. Verify TypeScript support
3. Check bundle size impact
4. Test for any conflicts with existing packages
5. Document the purpose of the dependency in the PR

## Example package.json Update

```json
{
  "dependencies": {
    // Existing dependencies...
    
    // New dependencies (example)
    "@blocknote/react": "^0.9.0",
    "@google/generative-ai": "^0.2.0",
    "@azure/openai": "^1.0.0",
    "react-resizable-panels": "^2.0.0",
    "react-pdf": "^7.0.0"
  }
}
```

## Dependency Maintenance

- Regularly update dependencies to their latest compatible versions
- Use `npm audit` to check for security vulnerabilities
- Remove unused dependencies to keep the bundle size optimized
- Consider using tools like Dependabot for automated updates
