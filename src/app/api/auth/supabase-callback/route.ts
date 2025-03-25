// app/api/auth/supabase-callback/route.ts
import {type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get the base URL for all redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Get the NextAuth token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // console.log("Token in supabase-callback:", token);
    
    if (!token || !token.idToken) {
      // console.error("No ID token available");
      return NextResponse.redirect(new URL('/login?error=no-id-token', baseUrl));
    }

    // Create a response object for redirect
    const response = NextResponse.redirect(
      new URL('/documents', baseUrl)
    );
    
    // Create Supabase client with server-side cookie management
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          }
        },
      }
    );
    
    // First check if user already exists in Supabase
    const { data: { session: existingSession } } = await supabase.auth.getSession();
    
    if (existingSession) {
      // console.log("User already has a valid Supabase session");
      return response;
    }
    
    // Sign in with the Google ID token
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: token.idToken as string,
      nonce: token.nonce as string || undefined,
    });
    
    if (error) {
      // console.error("Error signing in to Supabase:", error);
      
      // If the error is about user not existing, we need to sign up instead
      if (error.message.includes("User from sub claim in JWT does not exist")) {
        // console.log("Attempting to create a new user with the Google ID token");
        
        try {
          // Try to sign up with the Google ID token
          const {  error: signUpError } = await supabase.auth.signUp({
            email: token.email as string,
            password: token.idToken as string,
            options: {
              data: {
                name: token.name,
                picture: token.picture,
                // Add any additional user metadata here
              }
            }
          });
          
          if (signUpError) {
            // console.error("Error creating new user:", signUpError);
            return NextResponse.redirect(
              new URL(`/login?error=${encodeURIComponent(signUpError.message)}`, baseUrl)
            );
          }
          
          // console.log("New user created successfully:", signUpData);
          
          // Now try to sign in again with the ID token
          const { error: retryError } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: token.idToken as string,
            nonce: token.nonce as string || undefined,
          });
          
          if (retryError) {
            // console.error("Error signing in after user creation:", retryError);
            return NextResponse.redirect(
              new URL(`/login?error=${encodeURIComponent(retryError.message)}`, baseUrl)
            );
          }
        } catch (signUpError) {
          // console.error("Exception during sign up process:", signUpError);
          if(signUpError)
          return NextResponse.redirect(
            new URL('/login?error=signup-failed', baseUrl)
          );
        }
      } else {
        // For other errors, redirect to login with the error message
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, baseUrl)
        );
      }
    }
    
    // console.log("Supabase sign-in successful:", data);
    
    // The cookies have already been set by the Supabase client
    return response;
    
  } catch (error) {
    // console.error("Error in supabase-callback handler:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if(error)
    return NextResponse.redirect(
      new URL('/login?error=callback-failed', baseUrl)
    );
  }
}