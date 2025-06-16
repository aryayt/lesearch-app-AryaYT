import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        const { provider, active_models } = await request.json();

        const { error } = await supabase
            .from('user_keys')
            .update({ active_models })
            .eq('user_id', user.id)
            .eq('provider', provider);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update models' },
            { status: 500 }
        );
    }
} 