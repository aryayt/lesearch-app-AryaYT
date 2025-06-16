import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server";

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    console.log(email, otp)
    // Step 1: Verify OTP
    const { data: storedOtp, error: otpError } = await supabase
      .from("otp")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .gte("expires_at", new Date().toISOString()) // Ensure OTP is not expired
      .single();


    if (otpError) {
      console.error("OTP verification error:", otpError.message);
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    if (!storedOtp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }


    // Step 3: Delete the used OTP
    const { error: deleteOtpError } = await supabase
      .from("otp")
      .delete()
      .eq("email", email)
      .eq("otp", otp);
    if (deleteOtpError) {
      console.error("Error deleting OTP:", deleteOtpError.message);
    }

    return NextResponse.json(
      { message: "Code verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json(
      { message: "An error occurred while verifying code" },
      { status: 500 },
    );
  }
}
