import React, { useEffect, useState, useCallback, memo } from "react";
import { type Tab, usePanelStore } from "@/store/usePanelStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FilePen, FileText, Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import { AnaraViewer } from "../anara/anara";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useStore } from "@/store/useCollectionStore";
import { SaveStatus } from "../sidebar/save-status";
import { useDocStore } from "@/store/useDocStore";
import { usePdfStore } from "@/store/usePdfStore";
import EditorLayout from "../platejs/EditorLayout";
import type { Annotation } from "@/anaralabs/lector";

interface TabContentProps {
  tab: Tab;
  pdfs: Record<string, { highlights: Annotation[] }>;
}

// Memoize the tab content to prevent unnecessary re-renders
const TabContent = memo(({ tab, pdfs }: TabContentProps) => {
  if (tab.type === "pdf" && tab.pdfUrl) {
    return (
      <AnaraViewer
        pdfId={tab.id}
        pdfUrl={tab.pdfUrl}
        pdfHighlights={pdfs[tab.id]?.highlights || []}
      />
    );
  }
  return <EditorLayout docid={tab.id} />;
});
TabContent.displayName = 'TabContent';

interface TabTriggerProps {
  tab: Tab;
  onRemove: (id: string) => void;
}

// Memoize the tab trigger to prevent unnecessary re-renders
const TabTrigger = memo(({ tab, onRemove }: TabTriggerProps) => (
  <div
    key={tab.id}
    className="relative flex items-center group flex-shrink-0 h-full border-r border-gray-200 last:border-r-0 overflow-hidden"
  >
    <TabsTrigger
      value={tab.id}
      className="flex items-center gap-1 px-3 h-full text-xs font-medium leading-none truncate max-w-[180px] rounded-none shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground data-[state=active]:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 border-b-2 border-transparent data-[state=active]:border-b-primary -mb-[2px] pr-6"
    >
      {tab.type === "pdf" ? (
        <FileText size={15} />
      ) : (
        <FilePen size={15} />
      )}
      <span className="truncate">{tab.name}</span>
    </TabsTrigger>
    <button
      type="button"
      aria-label={`Close ${tab.name}`}
      className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity cursor-pointer flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
        onRemove(tab.id);
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <X size={11} className="text-gray-500" />
    </button>
  </div>
));
TabTrigger.displayName = 'TabTrigger';

const LeftPanel = () => {
  const {
    activePageId,
    getLeftPanelTabs,
    removeTab,
    leftActiveTabId,
    setLeftActiveTabId,
  } = usePanelStore();
  const { pdfs } = usePdfStore();
  const { setCreation } = useStore();
  const tabs = getLeftPanelTabs();
  const { saveStatus } = useDocStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Keep track of the previous leftActiveTabId
  const prevLeftActiveTabIdRef = React.useRef(leftActiveTabId);

  // Fix to ensure left panel tab selection is maintained
  useEffect(() => {
    // If we have tabs but no active tab is selected, set the first tab as active
    if (
      tabs.length > 0 &&
      (!leftActiveTabId || !tabs.find((tab) => tab.id === leftActiveTabId))
    ) {
      setLeftActiveTabId(tabs[0].id);
    }

    // Update the previous active tab ref
    prevLeftActiveTabIdRef.current = leftActiveTabId;
  }, [tabs, leftActiveTabId, setLeftActiveTabId]);

  const handleAddNote = useCallback(() => {
    setIsDropdownOpen(false);
    setTimeout(() => {
      setCreation({ parentId: activePageId, type: "note", panel: "left" });
    }, 0);
  }, [activePageId, setCreation]);

  const handleRemoveTab = useCallback((tabId: string) => {
    removeTab(tabId, "left");
  }, [removeTab]);

  if (tabs.length === 0) return null;

  return (
    <Tabs
      value={leftActiveTabId}
      onValueChange={setLeftActiveTabId}
      defaultValue={leftActiveTabId || tabs[0]?.id}
      className="flex flex-col w-full h-full"
    >
      <TabsList className="w-full p-0 bg-background justify-start border-b border-border rounded-none flex-shrink-0 h-8 overflow-hidden">
        <div className="flex flex-1 min-w-0 h-full overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <TabTrigger key={tab.id} tab={tab} onRemove={handleRemoveTab} />
          ))}
        </div>
        <SaveStatus status={saveStatus[leftActiveTabId]} />
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onSelect={handleAddNote}
            >
              <FileText size={16} />
              Add Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TabsList>
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab: Tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="flex flex-col mt-0 h-full overflow-hidden"
          >
            <TabContent tab={tab} pdfs={pdfs} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

LeftPanel.displayName = 'LeftPanel';
export default memo(LeftPanel);
