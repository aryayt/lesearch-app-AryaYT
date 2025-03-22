// pages/api/auth/send-otp.ts
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js"; // Import SupabaseClient type

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
)



// Check if OTP already exists or expired
async function checkExistingOtp(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase
    .from("otp")
    .select("otp, expires_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error checking OTP:", error.message);
    return null;
  }

  if (data && new Date(data.expires_at) > new Date()) {
    return data.otp; // OTP still valid
  }
  return null; // No valid OTP found
}

export async function POST(req: Request) {
  try {
    const { email,isSignup } = await req.json();

    //  Check if the email already exists in the "users" table
    const { data: existingUser, error: rpcError } = await supabase.rpc(
      "get_user_id_by_email",
      { email },
    );
    if (rpcError) {
      console.error("Error fetching user ID by email:", rpcError.message);
      return NextResponse.json(
        { message: 'If your email is registered, you will receive a reset code' },
        { status: 500 },
      );
    }
    if (isSignup && existingUser.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }
    if (!isSignup && existingUser.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400 },
      );
    }

    //  Check if there's already an active OTP
    const existingOtp = await checkExistingOtp(supabase, email);
    if (existingOtp) {
      return NextResponse.json(
        { message: "An OTP is already active. Please check your email." },
        { status: 400 },
      );
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    //  Store OTP in the 'otp' table with an expiration time of 10 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 10 minutes from now
    const { error: otpError } = await supabase.from("otp").insert([
      {
        email,
        otp,
        expires_at: expiresAt,
      },
    ]);

    if (otpError) {
      console.error("Error inserting OTP into Supabase:", otpError.message);
      return NextResponse.json(
        { message: "Error creating OTP" },
        { status: 500 },
      );
    }

    // Create reset link (optional, can be used in addition to OTP)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password?email=${encodeURIComponent(email)}&otp=${otp}`

    //  Send OTP via email using Nodemailer
    const transporter = nodemailer.createTransport({
      secure: true,
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Send email with OTP
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - LeSearch',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password for LeSearch.</p>
          <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>Alternatively, you can click the link below to reset your password:</p>
          <p><a href="${resetLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Thank you,<br>The LeSearch Team</p>
        </div>
      `,
    })

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    if(error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 },
      );
    }
  }
}
