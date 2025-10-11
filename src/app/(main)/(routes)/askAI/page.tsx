"use client";

import { useState } from "react";
import { generateUUID } from "@/app/(chat)/chatActions";
import { Chat } from "@/components/chat/chat";
import { useUserStore } from "@/store/userStore";

const AskAIPage = () => {
	const { user } = useUserStore();

	// Initialize chat ID immediately to avoid race conditions
	// Using lazy initialization ensures UUID is generated only once
	const [chatId] = useState<string>(() => generateUUID());

	if (!user) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-muted-foreground">Please log in to continue</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen w-full">
			{/* Header */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 max-w-screen-2xl items-center px-4">
					<div className="flex flex-1 items-center justify-between space-x-2">
						<div className="flex items-center space-x-2">
							<h1 className="text-lg font-semibold">LeSearch AI</h1>
							<span className="text-xs text-muted-foreground">
								Ask me anything
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Chat Component */}
			<div className="flex-1 overflow-hidden">
				<Chat
					id={chatId}
					initialMessages={[]}
					selectedChatModel="gemini-2.0-flash-exp"
					provider="google"
					isReadonly={false}
				/>
			</div>
		</div>
	);
};

export default AskAIPage;
