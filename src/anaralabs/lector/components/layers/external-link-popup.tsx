interface ExternalLinkPopupProps {
  url: string;
  onClose: () => void;
  onNavigate: () => void;
}

export const ExternalLinkPopup = ({ url, onClose, onNavigate }: ExternalLinkPopupProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-popover rounded-lg border shadow-md p-4 min-w-[300px] max-w-[500px]">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h3 className="text-lg font-semibold text-foreground">External Link</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-6 w-6 rounded-full hover:bg-muted/80 transition-colors"
          >
            <svg
              className="h-4 w-4 text-foreground/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 max-h-64 overflow-y-auto p-3 border rounded-md bg-muted/50 dark:bg-muted/20 text-foreground break-all">
          {url}
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted/80 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onNavigate}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Link
          </button>
        </div>
      </div>
    </div>
  );
};
