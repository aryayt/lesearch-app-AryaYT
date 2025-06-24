import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Get query parameters from the request URL
  const searchParams = req.nextUrl.searchParams;
  const mainpaperId = searchParams.get("mainpaperId");
  const citationTitle = searchParams.get("citationTitle");

  const supabase =await createClient();
  const { data: user } = await supabase.auth.getUser();
  const userId = user?.user?.id;

  // Validate required parameters
  if (!userId || !mainpaperId || !citationTitle) {
    return NextResponse.json(
      {
        message:
          "Missing required parameters. userId, mainpaperId, and citationOpenAccessId are required",
      },
      { status: 400 },
    );
  }

  try {
    // Build the query string for the backend API request
    const queryParams = new URLSearchParams({
      user_id: userId,
      main_paper_id: mainpaperId,
      citation_title: citationTitle,
    });

    // Send request to backend API
    const response = await fetch(
      `${process.env.BACKEND_URL}/citation_chat/get_citation_summary?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(60 * 1000), // 60 second timeout
      },
    );

    // Check if the response was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { message: "Failed to fetch citation summary from backend" },
        { status: response.status },
      );
    }

    // Return the response from the backend API
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching citation summary:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the citation summary" },
      { status: 500 },
    );
  }
}
