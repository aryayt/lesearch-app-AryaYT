# Authentication System Documentation

## Overview

Lesearch implements a hybrid authentication system using NextAuth.js and Supabase. This approach combines the flexibility of NextAuth for OAuth providers with Supabase's authentication and database capabilities.

## Authentication Flow

### Sign-in with Google

1. **Initial OAuth Flow**:
   - User clicks the Google sign-in button on the login page
   - NextAuth.js initiates the OAuth flow with Google
   - Google returns an authorization code to the NextAuth callback URL

2. **Token Exchange**:
   - NextAuth exchanges the authorization code for access and ID tokens
   - The tokens are stored in the NextAuth JWT

3. **Supabase Integration**:
   - The user is redirected to `/api/auth/supabase-callback`
   - The callback handler extracts the Google ID token from the NextAuth JWT
   - The ID token is used to sign in or create a user in Supabase

4. **Session Management**:
   - Supabase creates a session and returns session cookies
   - The cookies are set in the response headers
   - The user is redirected to the documents page

### Email/Password Authentication

1. **Sign Up**:
   - User enters email, password, and other required information
   - Supabase creates a new user and sends a verification email
   - User verifies their email address by clicking the link

2. **Sign In**:
   - User enters email and password on the login page
   - Supabase validates the credentials and creates a session
   - Session cookies are set in the browser
   - User is redirected to the documents page

## Password Recovery

1. User enters their email on the forgot-password page
2. Supabase sends a password reset email with a magic link
3. User clicks the link and is directed to a password reset form
4. User enters a new password and submits the form
5. Supabase updates the password and creates a new session

## User Profile Completion

New users are required to complete their profile after initial authentication:

1. User signs up or signs in with Google for the first time
2. Middleware checks if the user has completed their profile
3. If not, the user is redirected to the `/complete-profile` page
4. User completes a multi-step form with personal information
5. Profile data is saved to Supabase
6. User metadata is updated with `isLoggedin: true`
7. User is redirected to the documents page

## Session Management

- **Supabase Sessions**: Stored as cookies in the browser
- **Middleware**: Validates session on each request to protected routes
- **Client-Side**: Uses the Zustand store to manage user state

## Important Implementation Details

### NextAuth Configuration

Located in `src/app/api/auth/[...nextauth]/options.ts`:
- Configures Google as an OAuth provider
- Sets up JWT and session callbacks to store tokens
- Configures the redirect callback to point to the Supabase callback

### Supabase Callback

Located in `src/app/api/auth/supabase-callback/route.ts`:
- Extracts the ID token from the NextAuth JWT
- Uses the token to sign in or create a user in Supabase
- Handles error cases and redirects appropriately

### Middleware

Located in `src/middleware.ts` and `src/lib/supabase/middleware.ts`:
- Updates Supabase session cookies on each request
- Protects routes based on authentication status
- Redirects users to appropriate pages based on profile completion status

### Zustand Store

Located in `src/store/userStore.ts`:
- Manages user state with persistence in localStorage
- Handles rehydration issues with client-side navigation
- Provides methods for fetching user data and signing out

## Known Issues and Solutions

- **Navigation Issue**: Buttons in the documents page were unresponsive after redirecting from the complete profile page
  - **Solution**: Use `window.location.href` instead of `router.push()` to force a full page reload when redirecting from the complete profile page to ensure proper rehydration of the Zustand store

## Environment Variables

The following environment variables are required for authentication:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (for password reset)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=your-email
EMAIL_SERVER_PASSWORD=your-email-password
```
