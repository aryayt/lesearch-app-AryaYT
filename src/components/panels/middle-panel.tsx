import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FileText,File,Plus,X } from 'lucide-react'
import { Button } from '@/components/ui/button'
// import { PDFViewer } from '@/components/pdf-viewer/pdfViewer'
import Editor from '@/components/blocknote/editor'
import { AnaraViewer } from '../anara/anara'

type TabType = 'pdf' | 'note'
interface Tab {
  id: string
  title: string
  content: string
  type: TabType
}

const fileTypeIcons: Record<TabType | 'default', React.ReactNode> = {
    pdf: <FileText size={15} className="text-red-500 shrink-0" />,
    note: <File size={15} className="text-green-500 shrink-0" />,
    default: <FileText size={15} className="text-gray-400 shrink-0" />,
  }

const MiddlePanel = () => {
      const [tabs, setTabs] = React.useState<Tab[]>([
        { id: "tab1", title: "Document.pdf", content: "PDF preview here.", type: "pdf" },
        { id: "tab2", title: "Resume.pdf", content: "Resume preview here.", type: "pdf" },
        { id: "tab3", title: "Notes.md", content: "Notes content here.", type: "note" },
      ])
      const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || "")
      const [popoverOpen, setPopoverOpen] = React.useState(false)
    
      const addTab = (type: TabType) => {
        const typeDefaults: Record<TabType, { title: string; content: string }> = {
          pdf: { title: `Document ${tabs.filter(t => t.type === 'pdf').length + 1}.pdf`, content: "PDF preview here." },
          note: { title: `Notes ${tabs.filter(t => t.type === 'note').length + 1}.md`, content: "Notes content here." },
        }
        const newTab: Tab = {
          id: `tab${Date.now()}`,
          type,
          ...(typeDefaults[type] || { title: 'Untitled', content: "New tab." }),
        }
        setTabs([...tabs, newTab])
        setActiveTab(newTab.id)
        setPopoverOpen(false)
      }
    
      const removeTab = (tabId: string) => {
        const idx = tabs.findIndex(tab => tab.id === tabId)
        const newTabs = tabs.filter(tab => tab.id !== tabId)
        setTabs(newTabs)
    
        if (activeTab === tabId) {
          if (newTabs.length > 0) {
            const newActiveIndex = Math.max(0, idx - 1)
            setActiveTab(newTabs[newActiveIndex].id)
          } else {
            setActiveTab("")
          }
        }
      }
    
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col w-full h-full overflow-hidden">
      <TabsList className="w-full p-0 bg-background justify-start border-b border-border rounded-none flex-shrink-0 h-8">
        <div className="flex flex-1 min-w-0 h-full overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="relative flex items-center group flex-shrink-0 h-full border-r border-gray-200 last:border-r-0"
                >
                  <TabsTrigger
                    value={tab.id}
                    className="flex items-center gap-1 px-3 h-full text-xs font-medium leading-none truncate max-w-[180px] rounded-none shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground data-[state=active]:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 border-b-2 border-transparent data-[state=active]:border-b-primary -mb-[2px] pr-6"
                  >
                    {fileTypeIcons[tab.type as keyof typeof fileTypeIcons] || fileTypeIcons.default}
                    <span className="truncate">{tab.title}</span>
                  </TabsTrigger>
                  {tabs.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Close ${tab.title}`}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity cursor-pointer flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTab(tab.id)
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <X size={11} className="text-gray-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center h-full flex-shrink-0 px-1">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPopoverOpen((v) => !v)}
                  aria-label="Add tab"
                >
                  <Plus size={16} />
                </Button>
                {popoverOpen && (
                  <div className="absolute right-0 z-20 mt-1 w-32 rounded border bg-popover shadow-lg text-xs text-foreground py-1 animate-in fade-in min-w-32">
                    <button
                      type="button"
                      className="hover:bg-accent px-3 py-1 cursor-pointer flex items-center gap-2 w-full text-left"
                      onClick={() => addTab('pdf')}
                    >
                      {fileTypeIcons.pdf} PDF
                    </button>
                    <button
                      type="button"
                      className="hover:bg-accent px-3 py-1 cursor-pointer flex items-center gap-2 w-full text-left"
                      onClick={() => addTab('note')}
                    >
                      {fileTypeIcons.note} Notes
                    </button>
                  </div>
                )}
              </div>
            </div>
      </TabsList>
      <div className=" h-full">
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="flex flex-col mt-0 h-full overflow-hidden">
                {
                  tab.type === 'pdf' ? (
                          // <PDFViewer pdfUrl={"https://geqxiumlcggtzltbrlkg.supabase.co/storage/v1/object/sign/documents/user-files/082eaeb4-37ae-4ce5-ae81-9115fa22e8f8/1744801218554-Resume.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5Xzc5MTY3MGI4LWZkMzUtNDE1MC05YTNhLWM4ZGViMmI3YWViOCJ9.eyJ1cmwiOiJkb2N1bWVudHMvdXNlci1maWxlcy8wODJlYWViNC0zN2FlLTRjZTUtYWU4MS05MTE1ZmEyMmU4ZjgvMTc0NDgwMTIxODU1NC1SZXN1bWUucGRmIiwiaWF0IjoxNzQ3MDM4MDI5LCJleHAiOjE3NDc2NDI4Mjl9.ngRdC8t5v4el4dBAtH7nXpKcWfwiIwqWhkrMrv7u3SI"} />
                          <AnaraViewer pdfUrl={"https://geqxiumlcggtzltbrlkg.supabase.co/storage/v1/object/sign/documents/user-files/082eaeb4-37ae-4ce5-ae81-9115fa22e8f8/1744801218554-Resume.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5Xzc5MTY3MGI4LWZkMzUtNDE1MC05YTNhLWM4ZGViMmI3YWViOCJ9.eyJ1cmwiOiJkb2N1bWVudHMvdXNlci1maWxlcy8wODJlYWViNC0zN2FlLTRjZTUtYWU4MS05MTE1ZmEyMmU4ZjgvMTc0NDgwMTIxODU1NC1SZXN1bWUucGRmIiwiaWF0IjoxNzQ3MDM4MDI5LCJleHAiOjE3NDc2NDI4Mjl9.ngRdC8t5v4el4dBAtH7nXpKcWfwiIwqWhkrMrv7u3SI"}/>
                  ) : (
                    <Editor />
                  )
                }
              </TabsContent>
            ))}
      </div>
    </Tabs>
  )
}

export default MiddlePanel