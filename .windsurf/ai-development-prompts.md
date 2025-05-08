# AI Development Prompts

## Overview

This document provides standardized prompts and instructions for AI assistants working on the Lesearch project. These prompts help ensure consistency, adherence to project standards, and efficient development.

## General Development Guidelines

When working on the Lesearch project, AI assistants should:

1. Use the latest versions of dependencies as specified in the dependencies.md file
2. Follow the coding standards outlined in coding-standards.md
3. Maintain the existing architecture and component structure
4. Ensure all code is properly typed with TypeScript
5. Implement proper error handling and accessibility features
6. Write clean, maintainable, and well-documented code

## Feature Implementation Prompts

### Adding New Components

```
Create a new [component name] component for Lesearch that [describe purpose]. 
The component should:
- Follow the shadcn/ui and Tailwind CSS styling patterns
- Be fully typed with TypeScript
- Include proper accessibility attributes
- Be responsive across different screen sizes
- Include proper error handling
- Follow the project's component structure

The component should be placed in [appropriate directory] and exported properly.
```

### Implementing API Routes

```
Create a new API route for [feature] in the Lesearch application.
The API route should:
- Use Next.js App Router API conventions
- Implement proper error handling and status codes
- Be properly typed with TypeScript
- Include appropriate validation for inputs
- Follow RESTful principles
- Include proper authentication checks where needed
```

### State Management Implementation

```
Implement a Zustand store for [feature] in the Lesearch application.
The store should:
- Follow the existing store patterns in the project
- Use TypeScript for proper typing
- Implement persistence if needed using the persist middleware
- Include all necessary actions and selectors
- Handle loading and error states appropriately
```

## Bug Fixing Prompts

```
Fix the [describe bug] issue in the Lesearch application.
When implementing the fix:
1. Identify the root cause of the issue
2. Implement a solution that addresses the root cause, not just the symptoms
3. Ensure the fix doesn't introduce new issues
4. Add appropriate error handling if relevant
5. Consider edge cases that might be affected by the change
6. Follow the project's coding standards
```

## Code Review Prompts

```
Review the following code for the Lesearch application:

[code to review]

Provide feedback on:
1. Adherence to project coding standards
2. TypeScript type safety
3. Performance considerations
4. Accessibility compliance
5. Error handling
6. Potential edge cases
7. Code organization and readability
8. Suggested improvements
```

## Testing Prompts

```
Create tests for the [component/function] in the Lesearch application.
The tests should:
- Use React Testing Library for component tests
- Cover the main functionality and edge cases
- Test error handling
- Mock external dependencies appropriately
- Follow the project's testing patterns
```

## Documentation Prompts

```
Create documentation for the [feature/component] in the Lesearch application.
The documentation should include:
1. Overview of the feature/component
2. Usage examples
3. Props/parameters and their types
4. Return values/rendered output
5. Dependencies and requirements
6. Edge cases and limitations
7. Related components or functions
```

## Multi-Panel Interface Implementation

```
Implement a resizable panel layout for the Lesearch application using react-resizable-panels.
The implementation should:
1. Support [number] panels with configurable initial sizes
2. Allow panels to be resized by dragging dividers
3. Support minimum and maximum size constraints
4. Save panel layout preferences to user settings
5. Be responsive across different screen sizes
6. Support collapsing/expanding panels
7. Follow accessibility guidelines for resizable interfaces
```

## AI Integration Implementation

```
Implement integration with [AI provider] for the Lesearch application.
The implementation should:
1. Set up proper API client for the provider
2. Implement authentication and API key management
3. Create a service for making API calls
4. Handle rate limiting and error cases
5. Implement streaming responses if supported
6. Create a user interface for interacting with the AI
7. Follow security best practices for API key handling
```

## Paper Management Implementation

```
Implement [specific feature] for paper management in the Lesearch application.
The implementation should:
1. Integrate with Supabase for data storage
2. Support proper file handling for PDFs
3. Extract and store paper metadata
4. Implement proper error handling for file operations
5. Create a user-friendly interface for the feature
6. Follow the existing patterns for paper management
```

## Remember

When implementing any feature or fixing any bug:

1. Always start by understanding the existing codebase
2. Follow the established patterns and conventions
3. Use the latest versions of dependencies
4. Ensure all code is properly typed with TypeScript
5. Implement proper error handling and accessibility features
6. Write clean, maintainable, and well-documented code
7. Consider performance implications of changes
8. Test thoroughly before submitting changes
