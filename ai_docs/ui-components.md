# UI Components and Interface Structure

## Overview

Lesearch uses a modern UI framework built with React, Next.js, and Tailwind CSS. The UI components are primarily based on the shadcn/ui library, which provides accessible and customizable components built on top of Radix UI primitives.

## Component Structure

### Layout Components

- **Root Layout** (`src/app/layout.tsx`): The root layout that wraps the entire application
- **Main Layout** (`src/app/(main)/layout.tsx`): Layout for authenticated pages with sidebar and header
- **Auth Layout** (`src/app/(auth)/layout.tsx`): Layout for authentication pages
- **Landing Layout** (`src/app/(landing)/layout.tsx`): Layout for public landing pages

### Navigation Components

- **AppSidebar** (`src/app/(main)/_components/sidebar/app-sidebar.tsx`): Main navigation sidebar with collapsible sections
- **NavMain** (`src/app/(main)/_components/sidebar/nav-main.tsx`): Primary navigation items
- **NavFavorites** (`src/app/(main)/_components/sidebar/nav-favorites.tsx`): Favorite items section
- **NavWorkspaces** (`src/app/(main)/_components/sidebar/nav-workspaces.tsx`): Workspace navigation
- **Header** (`src/app/(main)/_components/header/app-header.tsx`): Application header with user profile and actions

### Authentication Components

- **LoginPage** (`src/app/(auth)/login/page.tsx`): User login form with email/password and Google sign-in
- **SignupPage** (`src/app/(auth)/signup/page.tsx`): User registration form
- **ForgotPasswordPage** (`src/app/(auth)/forgot-password/page.tsx`): Password recovery form
- **CompleteProfile** (`src/app/(auth)/complete-profile/page.tsx`): Multi-step profile completion form

### Dashboard Components

- **Documents Page** (`src/app/(main)/(routes)/documents/page.tsx`): Main dashboard view
- **AskAI Page** (`src/app/(main)/(routes)/askAI/page.tsx`): AI interaction interface
- **GraphView Page** (`src/app/(main)/(routes)/graphview/page.tsx`): Visual graph representation of papers

## UI Framework

### shadcn/ui Components

Lesearch uses shadcn/ui components for consistent design and accessibility. Key components include:

- **Button**: Various button styles (primary, secondary, outline, ghost)
- **Input**: Form input fields
- **Form**: Form components with validation using React Hook Form and Zod
- **Card**: Content containers with header, content, and footer sections
- **Dialog**: Modal dialogs for user interactions
- **Avatar**: User profile images with fallback support
- **Sidebar**: Collapsible sidebar with customizable width
- **Carousel**: Multi-step form interface for profile completion

### Custom Components

- **Logo** (`src/components/logo.tsx`): Application logo component
- **FullScreenLoading** (`src/components/full-screen-loading.tsx`): Loading indicator for page transitions
- **SidebarUser** (`src/app/(main)/_components/sidebar/sidebar-user.tsx`): User profile section in the sidebar

## Responsive Design

The application is fully responsive with different layouts for:

- **Mobile**: Collapsible sidebar, stacked components
- **Tablet**: Partially visible sidebar, grid layouts
- **Desktop**: Full sidebar, multi-column layouts

## Theme Support

Lesearch supports both light and dark themes using the `next-themes` package:

- Theme switching is available in the user profile dropdown
- Theme preference is stored in localStorage
- System preference detection is supported

## Animation and Transitions

- **Page Transitions**: Smooth transitions between pages using Framer Motion
- **Component Animations**: Subtle animations for interactive elements
- **Loading States**: Animated loading indicators for async operations

## Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Attributes**: Proper ARIA roles and attributes for screen readers
- **Focus Management**: Visible focus indicators and proper focus trapping in modals
- **Color Contrast**: Sufficient contrast ratios for text and background colors

## Future UI Enhancements

- **Resizable Panels**: Implementation of resizable panels for the document viewer and editor
- **Drag and Drop**: Support for drag and drop file uploads
- **Rich Text Editor**: Integration of a rich text editor for note-taking
- **PDF Viewer**: Embedded PDF viewer for research papers
