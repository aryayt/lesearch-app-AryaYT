import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    // Initialize Supabase client
    const supabase = await createClient();

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
