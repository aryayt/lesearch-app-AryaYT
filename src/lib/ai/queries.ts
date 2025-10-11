import { generateText, type Message } from "ai";
import { createClient } from "@/lib/supabase/server";
import { initializeProvider } from "./providers";

export async function generateTitleFromUserMessage({
	message,
}: {
	message: Message;
}) {
	const apiKey = await getAPIKey("google");
	const provider = await initializeProvider("google", apiKey);
	const { text: title } = await generateText({
		model: provider.languageModel("gemini-2.0-flash"),
		system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - do not use quotes or colons`,
		prompt: JSON.stringify(message),
	});

	return title;
}

export const getAPIKey = async (provider: string): Promise<string> => {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("User not authenticated");
	}

	// Use the new decryption function to get the API key
	// This calls the secure decrypt_user_api_key function in the database
	// Returns a single TEXT value (the decrypted API key)
	const { data, error } = await supabase.rpc("get_api_key", {
		provider_param: provider,
	});

	if (error) {
		console.error("Error getting API key:", error);
		throw error;
	}

	if (!data) {
		throw new Error(`No API key found for provider: ${provider}`);
	}

	// RPC function returns TEXT directly, not an array
	return data as string;
};

export async function saveAPIKey(provider: string, key: string) {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("User not authenticated");
	}

	const { error } = await supabase.from("user_keys").upsert(
		{
			provider,
			user_id: user.id,
			api_key: key,
			api_key_ff: key.slice(0, 4),
			active_models: [],
		},
		{
			onConflict: "provider,user_id",
		},
	);

	if (error) {
		console.error("Error saving API key:", error);
		throw error;
	}
	return true;
}
