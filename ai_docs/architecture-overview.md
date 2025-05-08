# Lesearch Architecture Overview

## Introduction

Lesearch is a web application focused on improving the readability and accessibility of research papers. The application provides a platform for users to read, annotate, and collaborate on research papers with AI-assisted features.

## Tech Stack

- **Frontend Framework**: Next.js 15.x (App Router)
- **UI Library**: React 19.x
- **Styling**: Tailwind CSS 4.x, shadcn/ui components
- **State Management**: Zustand with persist middleware
- **Authentication**: Supabase + NextAuth.js
- **Database**: Supabase
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner toast
- **Icons**: Lucide React

## Project Structure

```
frontend-v1/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Authentication-related pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── complete-profile/
│   │   ├── (landing)/          # Landing pages
│   │   ├── (main)/             # Main application pages
│   │   │   ├── (routes)/       # Application routes
│   │   │   │   ├── documents/
│   │   │   │   ├── askAI/
│   │   │   │   └── graphview/
│   │   │   ├── _components/    # Dashboard components
│   │   │   ├── _hooks/         # Dashboard-specific hooks
│   │   │   └── layout.tsx      # Main layout wrapper
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication API routes
│   │   │   │   ├── [...nextauth]/
│   │   │   │   ├── (otp)/
│   │   │   │   └── supabase-callback/
│   ├── components/             # Shared components
│   ├── hooks/                  # Shared hooks
│   ├── lib/                    # Utility functions and libraries
│   │   ├── supabase/           # Supabase client and middleware
│   ├── store/                  # Zustand stores
│   │   ├── userStore.ts        # User state management
│   └── middleware.ts           # Next.js middleware
```

## Authentication Flow

Lesearch implements a hybrid authentication system using NextAuth.js and Supabase:

1. **NextAuth.js**: Handles the initial OAuth flow with providers like Google
2. **Custom Callback**: Intercepts the OAuth response and extracts tokens
3. **Supabase Integration**: Uses the tokens to authenticate/create users in Supabase
4. **Session Management**: Stores Supabase session tokens as cookies
5. **Protected Routes**: Middleware verifies authentication for protected routes

### Authentication Routes

- `/login`: User login page with email/password and Google sign-in options
- `/signup`: User registration page with email verification
- `/forgot-password`: Password recovery flow
- `/complete-profile`: New user onboarding to collect additional profile information

## User Flow

1. User signs up/logs in via email/password or Google OAuth
2. New users are directed to `/complete-profile` to complete their profile
3. After profile completion, users are redirected to `/documents` (main dashboard)
4. The dashboard provides access to documents, AI features, and other application functionality

## State Management

The application uses Zustand with persist middleware for state management:

- **userStore**: Manages user authentication state and profile data
- Persists data in localStorage with proper rehydration to avoid client-side navigation issues

## Key Components

- **AppSidebar**: Main navigation sidebar with collapsible sections
- **LayoutWrapper**: Dashboard layout wrapper with responsive design
- **Documents Page**: Main dashboard view for managing research papers
