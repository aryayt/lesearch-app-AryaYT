import "./lib/setup";
import {
	Root,
	Thumbnail,
	Thumbnails,
	usePdf,
	usePdfJump,
} from "@anaralabs/lector";
import { ZoomMenu } from "./zoom-menu";
import { DocumentMenu } from "./document-menu";
import {
	ChevronLeft,
	ChevronRight,
	Search,
	SidebarClose,
	SidebarOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { HighlightLayerContent } from "./highlight-layer-content";

// Navigation component that uses the PDF hooks
// This must be used inside the Root component
const PageNavigation = () => {
	const pages = usePdf((state) => state.pdfDocumentProxy?.numPages);
	const currentPage = usePdf((state) => state.currentPage);
	const { jumpToPage } = usePdfJump();

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			jumpToPage(currentPage - 1, { behavior: "auto" });
		}
	};

	const handleNextPage = () => {
		if (pages && currentPage < pages) {
			jumpToPage(currentPage + 1, { behavior: "auto" });
		}
	};

	const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value);
		if (!Number.isNaN(value) && value > 0 && pages && value <= pages) {
			jumpToPage(value, { behavior: "auto" });
		}
	};

	return (
		<div className="flex items-center gap-3">
			<Button
				onClick={handlePreviousPage}
				disabled={currentPage <= 1}
				variant="ghost"
				size="icon"
				className="h-8 w-8 rounded-full"
				aria-label="Previous page"
			>
				<ChevronLeft size={18} />
			</Button>

			<div className="flex items-center gap-1 min-w-[80px] justify-center">
				<label htmlFor="page-number" className="sr-only">
					Page number
				</label>
				<input
					id="page-number"
					type="number"
					value={currentPage}
					onChange={handlePageInputChange}
					className="w-12 h-8 text-center border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
					min={1}
					max={pages || 1}
					aria-label="Current page number"
				/>
				<span className="text-sm text-gray-500">/ {pages || "?"}</span>
			</div>

			<Button
				onClick={handleNextPage}
				disabled={!pages || currentPage >= pages}
				variant="ghost"
				size="icon"
				className="h-8 w-8 rounded-full"
				aria-label="Next page"
			>
				<ChevronRight size={18} />
			</Button>
		</div>
	);
};

interface PDFViewerProps {
	pdfUrl: string;
}

export function PDFViewer({ pdfUrl }: PDFViewerProps) {
	const [showThumbnails, setShowThumbnails] = useState(false);
	const [pdfSource, setPdfSource] = useState<string | ArrayBuffer | null>(null);
	useEffect(() => {
		// If the URL is a base64 data URL, use it directly
		if (pdfUrl.startsWith("data:application/pdf;base64,")) {
			setPdfSource(pdfUrl);
		} else {
			// Otherwise, fetch the PDF from the URL
			setPdfSource(pdfUrl);
		}
	}, [pdfUrl]);

	if (!pdfSource) {
		return (
			<div className="flex items-center justify-center h-full">
				<p>Loading PDF...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden w-full">
			<Root
				source={pdfSource}
				className="bg-gray-100 border rounded-md overflow-hidden relative flex flex-col justify-stretch"
				loader={<div className="p-4">Loading...</div>}
				isZoomFitWidth
				zoomOptions={{
					minZoom: 0.5, // 50% minimum zoom
					maxZoom: 10, // 1000% maximum zoom
				}}
			>
				{/* Fixed Header */}
				<div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b shadow-sm flex items-center justify-between p-2 w-full">
					{/* Left Section: Thumbnails, PDF Name, and Zoom */}
					<div className="flex items-center gap-2 min-w-0 flex-1">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										onClick={() => setShowThumbnails((show) => !show)}
										variant="ghost"
										size="icon"
										className="h-8 w-8"
									>
										{showThumbnails ? (
											<SidebarClose size={16} />
										) : (
											<SidebarOpen size={16} />
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									{showThumbnails ? "Hide Thumbnails" : "Show Thumbnails"}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

						{/* Zoom Menu */}
						<div className="bg-white dark:bg-gray-900 truncate min-w-0 flex-shrink-0">
							<ZoomMenu />
						</div>
					</div>

					{/* Center Section: Page Navigation */}
					<div className="bg-white dark:bg-gray-900 flex items-center justify-center min-w-0 mx-2 flex-shrink-0">
						<PageNavigation />
					</div>

					{/* Right Section: Search Bar, Document Menu */}
					<div className="bg-white dark:bg-gray-900 flex items-center gap-3 min-w-0 justify-end flex-shrink-0">
						{/* Search Bar */}
						<div className="flex-shrink-0 relative">
							<label htmlFor="pdf-search" className="sr-only">
								Search in document
							</label>
							<Search
								className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
								size={14}
							/>
							<input
								id="pdf-search"
								type="text"
								placeholder="Search in document"
								className="pl-8 pr-3 py-1.5 text-sm border rounded-md w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-primary"
							/>
						</div>

						<div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

						{/* Document Menu (Always visible) */}
						<div className="flex-shrink-0 min-w-0">
							<DocumentMenu documentUrl={pdfUrl} />
						</div>
					</div>
				</div>

				{/* Main Content with Thumbnails and PDF */}
				<div
					className={cn(
						"flex-1 min-h-0 flex transition-all duration-300",
						showThumbnails ? "grid-cols-[240px,1fr]" : "grid-cols-[0,1fr]",
					)}
				>
					{/* Thumbnails Panel */}
					<div
						className={cn(
							"overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-800 border-r transition-all duration-300",
							showThumbnails ? "w-60" : "w-0",
						)}
					>
						{showThumbnails && (
							<Thumbnails className="flex flex-col gap-3 items-center py-4 px-2">
								<Thumbnail className="transition-all w-40 hover:shadow-lg hover:ring-2 hover:ring-primary rounded-md overflow-hidden" />
							</Thumbnails>
						)}
					</div>

					{/* PDF Content */}
					<div className="overflow-auto h-full flex-1">
						<HighlightLayerContent />
					</div>
				</div>
			</Root>
		</div>
	);
}
