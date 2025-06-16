import { saveAPIKey } from "@/lib/ai/queries";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { key, provider } = body;
    

    if (!key || !provider) {
        return NextResponse.json({ error: "Missing key or provider" }, { status: 400 });
    }

    try {
        if (provider === "google") {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key);
            const data = await response.json();
            if (data.error) {
                return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
            }
            const saved = await saveAPIKey(provider, key);
            if (saved) {
                return NextResponse.json({ valid: true });
            } else {
                return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
            }
        } else if (provider === "openai") {
            const response = await fetch("https://api.openai.com/v1/models", {
                headers: {
                    "Authorization": `Bearer ${key}`
                }
            });
            const data = await response.json();
            if (data.error) {
                return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
            }
            return NextResponse.json({ valid: true });
        } else {
            return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
}