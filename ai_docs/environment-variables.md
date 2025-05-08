# Environment Variables in Lesearch

## Overview

Environment variables are used in the Lesearch application to store configuration settings and sensitive information such as API keys, secrets, and connection strings. These variables are essential for the application to function correctly while keeping sensitive data secure and allowing for different configurations across environments (development, staging, production).

## Accessing Environment Variables

The environment variables for the Lesearch project are stored in a private Notion document for security reasons. Team members can access these variables through:

**Notion Link**: [https://www.notion.so/env-variables-1ebd6e71cc1980b2b495d9e7c4022b9b#1ebd6e71cc1980bc9e57cecf89ef4073](https://www.notion.so/env-variables-1ebd6e71cc1980b2b495d9e7c4022b9b#1ebd6e71cc1980bc9e57cecf89ef4073)

This link contains all the necessary environment variables required to run the application locally or deploy it to different environments.

## Why We Use Environment Variables

1. **Security**: Keeping sensitive information like API keys and database credentials out of the codebase
2. **Configuration Management**: Easily switch between different environments (development, staging, production)
3. **Deployment Flexibility**: Configure the application differently based on deployment environment
4. **Separation of Concerns**: Keep configuration separate from code
5. **Compliance**: Follow security best practices for handling sensitive information

## Required Environment Variables

The Lesearch application requires the following environment variables:

### Application Configuration
- `NEXT_PUBLIC_APP_URL`: The base URL of the application (e.g., http://localhost:3000)
- `NEXTAUTH_URL`: The URL for NextAuth.js (typically the same as the app URL)
- `NEXTAUTH_SECRET`: A secret key used by NextAuth.js for encryption

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key for Supabase client-side operations
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`: The service role key for Supabase server-side operations

### Google OAuth Configuration
- `GOOGLE_CLIENT_ID`: The client ID for Google OAuth integration
- `GOOGLE_CLIENT_SECRET`: The client secret for Google OAuth integration

### Email Configuration (for password reset)
- `EMAIL_SERVER_HOST`: SMTP server host (e.g., smtp.gmail.com)
- `EMAIL_SERVER_PORT`: SMTP server port (e.g., 465 for SSL)
- `EMAIL_SERVER_USER`: Email address used for sending emails
- `EMAIL_SERVER_PASSWORD`: Password or app-specific password for the email account

## Setting Up Environment Variables

### Local Development

1. Create a `.env.local` file in the root directory of the project
2. Copy the environment variables from the Notion document
3. Paste them into the `.env.local` file
4. Restart your development server if it's already running

Example `.env.local` file:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
```

### Production Deployment

For production deployments, set the environment variables in your hosting platform:

- **Vercel**: Add environment variables in the project settings
- **Netlify**: Add environment variables in the site settings
- **Docker**: Use environment variables in your Docker Compose file or Kubernetes secrets

## Accessing Environment Variables in Code

### In Next.js Server Components/API Routes

```typescript
// Access server-side environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
```

### In Client-Side Components

Only variables prefixed with `NEXT_PUBLIC_` are accessible in client-side code:

```typescript
// Access client-side environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

## Security Considerations

1. **Never commit `.env.local` to version control**
   - The `.env.local` file is included in `.gitignore` to prevent accidental commits

2. **Use appropriate prefixes**
   - Only prefix variables with `NEXT_PUBLIC_` if they need to be accessible in client-side code
   - Keep sensitive variables without the `NEXT_PUBLIC_` prefix to ensure they're only available server-side

3. **Rotate secrets regularly**
   - Periodically update API keys, secrets, and passwords
   - Update the Notion document and inform team members when changes are made

4. **Limit access to the Notion document**
   - Only share the Notion link with team members who need access to the environment variables

## Troubleshooting

If you encounter issues with environment variables:

1. Verify that all required variables are set in your `.env.local` file
2. Check for typos in variable names
3. Ensure the values are correct and up-to-date
4. Restart your development server after making changes to environment variables
5. Clear your browser cache if client-side variables aren't updating
