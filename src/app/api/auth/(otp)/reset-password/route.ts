import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
  )

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

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
      if (existingUser.length === 0) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 400 },
        );
      }


    // Update the user's password using Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser[0].id,
        { password: newPassword }
      )

    if (updateError) {
      console.error("Error during password reset:", updateError.message);
      return NextResponse.json(
        { message: "Error resetting password" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in sign-up:", error);
    return NextResponse.json(
      { message: "An error occurred while creating user" },
      { status: 500 },
    );
  }
}
