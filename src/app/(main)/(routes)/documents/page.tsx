"use client";

import { FileText, Import, Mic, Plus, Search, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PDFImport } from "@/components/sidebar/pdf-import";
import { useStore } from "@/store/useCollectionStore";
import { usePanelStore } from "@/store/usePanelStore";
import { useUserStore } from "@/store/userStore";

// UUID validation schema
const uuidSchema = z.string().uuid();

const HomePage = () => {
	const { firstname } = useUserStore();
	const [searchQuery, setSearchQuery] = useState("");
	const { allItems, fetchFilesAndFolders, setCreation } = useStore();
	const { setActivePageId } = usePanelStore();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [showImportDialog, setShowImportDialog] = useState(false);

	// Fetch files and folders on mount
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			try {
				await fetchFilesAndFolders();
			} catch (error) {
				console.error("Failed to load library:", error);
				toast.error("Failed to load your library. Please refresh the page.");
			} finally {
				setIsLoading(false);
			}
		};
		loadData();
	}, [fetchFilesAndFolders]);

	// Filter items based on search query
	const filteredItems = allItems.filter((item) => {
		if (!searchQuery) return true;
		return item.name.toLowerCase().includes(searchQuery.toLowerCase());
	});

	// Get only root-level items (not in folders) and not deleted
	const rootItems = filteredItems.filter((item) => item.parentId === null);

	// Sort by most recent (create new array to preserve immutability)
	const sortedItems = [...rootItems].sort((a, b) => {
		if (!a.updated_at || !b.updated_at) return 0;
		return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
	});

	// Format date
	const formatDate = (dateString?: string) => {
		if (!dateString) return "Recently";
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) return "Today";
		if (diffInHours < 48) return "Yesterday";
		if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
		return date.toLocaleDateString();
	};

	// Get icon for item type
	const getItemIcon = (type: string) => {
		switch (type) {
			case "pdf":
				return FileText;
			case "note":
				return FileText;
			case "folder":
				return FileText;
			default:
				return FileText;
		}
	};

	// Handle item click with validation
	const handleItemClick = (itemId: string) => {
		// Validate UUID format to prevent injection attacks
		const validation = uuidSchema.safeParse(itemId);
		if (!validation.success) {
			toast.error("Invalid document ID");
			if (process.env.NODE_ENV !== "production") {
				console.error("Invalid UUID attempted:", itemId);
			}
			return;
		}

		setActivePageId(itemId);
		router.push(`/documents/${itemId}`);
	};

	return (
		<div className="w-full pt-4 pb-6">
			<div className="max-w-4xl mx-auto px-4 md:px-6">
				{/* Welcome Header */}
				<div className="mb-8 text-center animate-fade-in">
					<h1 className="text-3xl font-bold mb-1">
						Welcome back,{" "}
						<span className="text-primary">{firstname || "User"}</span>
					</h1>
					<p className="text-muted-foreground text-sm">
						Import documents and videos, start writing, or create a new
						recording
					</p>
				</div>

				{/* Action Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
					{/* Write Card */}
					<div
						onClick={() => setCreation({ parentId: null, type: "note" })}
						className="border rounded-lg p-3 flex flex-col items-center hover:bg-accent/50 transition-all duration-300 cursor-pointer group animate-fade-in-up delay-100"
					>
						<div className="bg-primary/10 p-2 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
							<FileText size={18} className="text-primary" />
						</div>
						<h2 className="font-medium text-sm">Write</h2>
						<p className="text-xs text-muted-foreground text-center">
							Write and cite with AI
						</p>
					</div>

					{/* Import Card */}
					<div
						onClick={() => setShowImportDialog(true)}
						className="border rounded-lg p-3 flex flex-col items-center hover:bg-accent/50 transition-all duration-300 cursor-pointer group animate-fade-in-up delay-200"
					>
						<div className="bg-primary/10 p-2 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
							<Import size={18} className="text-primary" />
						</div>
						<h2 className="font-medium text-sm">Import</h2>
						<p className="text-xs text-muted-foreground text-center">
							Write and Chat with docs
						</p>
					</div>

					{/* Explore Papers Card */}
					<div
						onClick={() => router.push("/lecoder")}
						className="border rounded-lg p-3 flex flex-col items-center hover:bg-accent/50 transition-all duration-300 cursor-pointer group relative animate-fade-in-up delay-300"
					>
						<div className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
							COMING SOON
						</div>
						<div className="bg-primary/10 p-2 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
							<Mic size={18} className="text-primary" />
						</div>
						<h2 className="font-medium text-sm">Explore Papers</h2>
						<p className="text-xs text-muted-foreground text-center">
							Discover and explore research papers
						</p>
					</div>
				</div>

				{/* Search Bar */}
				<div className="mb-4 animate-fade-in-up">
					<div className="relative max-w-md mx-auto">
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
							size={16}
						/>
						<Input
							placeholder="Search your library..."
							className="pl-9 bg-background border-muted h-9 text-sm focus:ring-1 focus:ring-primary/20 transition-all"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<Button
								variant="ghost"
								size="icon"
								className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
								onClick={() => setSearchQuery("")}
							>
								<span className="sr-only">Clear search</span>
								<X size={14} />
							</Button>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Actions Section */}
					<div className="md:col-span-1 animate-fade-in-up">
						<h3 className="text-xs font-medium mb-2 text-muted-foreground flex items-center">
							<span className="uppercase tracking-wider">Actions</span>
							<div className="ml-2 flex-grow h-px bg-border" />
						</h3>
						<div className="space-y-1.5">
							<div
								onClick={() => router.push("/askAI")}
								className="border rounded-md p-2 flex items-center gap-2 hover:bg-accent/50 transition-colors cursor-pointer group"
							>
								<div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
									<Sparkles size={14} className="text-primary" />
								</div>
								<span className="text-sm">Ask AI...</span>
							</div>
							<div
								onClick={() => setCreation({ parentId: null, type: "note" })}
								className="border rounded-md p-2 flex items-center gap-2 hover:bg-accent/50 transition-colors cursor-pointer group"
							>
								<div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
									<Plus size={14} className="text-primary" />
								</div>
								<span className="text-sm">Create new document</span>
							</div>
						</div>
					</div>

					{/* Library Section */}
					<div className="md:col-span-2 animate-fade-in-up">
						<h3 className="text-xs font-medium mb-2 text-muted-foreground flex items-center">
							<span className="uppercase tracking-wider">Library</span>
							<div className="ml-2 flex-grow h-px bg-border" />
						</h3>
						{isLoading ? (
							<div className="border rounded-lg p-8 flex items-center justify-center">
								<div className="text-sm text-muted-foreground">
									Loading your library...
								</div>
							</div>
						) : sortedItems.length === 0 ? (
							<div className="border rounded-lg p-8 flex flex-col items-center justify-center text-center">
								<FileText
									size={32}
									className="text-muted-foreground mb-2 opacity-50"
								/>
								<p className="text-sm text-muted-foreground mb-1">
									{searchQuery
										? "No documents found"
										: "Your library is empty"}
								</p>
								<p className="text-xs text-muted-foreground">
									{searchQuery
										? "Try a different search term"
										: "Create a document or import a PDF to get started"}
								</p>
							</div>
						) : (
							<div className="border rounded-lg overflow-hidden">
								{sortedItems.slice(0, 10).map((item, index) => {
									const Icon = getItemIcon(item.type);
									return (
										<div
											key={item.id}
											onClick={() => handleItemClick(item.id)}
											className={`flex items-center gap-2 p-2 hover:bg-accent/50 transition-colors cursor-pointer text-sm ${
												index !== sortedItems.length - 1 && index !== 9
													? "border-b"
													: ""
											}`}
										>
											<Icon size={14} className="text-muted-foreground shrink-0" />
											<span className="truncate flex-1" title={item.name}>
												{item.name}
											</span>
											<span className="text-xs text-muted-foreground">
												{formatDate(item.updated_at)}
											</span>
										</div>
									);
								})}
								{sortedItems.length > 10 && (
									<div className="p-2 text-center border-t">
										<button
											type="button"
											onClick={() => router.push("/documents")}
											className="text-xs text-primary hover:underline"
										>
											View all {sortedItems.length} items
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* PDF Import Dialog */}
			<PDFImport
				isOpen={showImportDialog}
				onClose={() => setShowImportDialog(false)}
			/>
		</div>
	);
};

export default HomePage;
