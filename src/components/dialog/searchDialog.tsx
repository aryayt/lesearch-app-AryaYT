"use client"

import * as React from "react"
import { Command } from "cmdk"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  File,
  FileText,
  Folder,
  Calendar,
  Search,
  ListFilter,
  X,
  ArrowRight,
  LayoutDashboard
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function SearchDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")

  // Sample data - in a real app, this would come from your database
  const recentSearches = [
    "Marketing plan", "Q1 budget", "Team meeting notes", "Roadmap"
  ]

  const recentPages = [
    { id: 1, title: "Q1 2024 Goals", type: "page", lastUpdated: "2h ago", icon: <FileText className="w-4 h-4" /> },
    { id: 2, title: "Team Weekly Tasks", type: "database", lastUpdated: "1d ago", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 3, title: "Product Roadmap", type: "page", lastUpdated: "3d ago", icon: <FileText className="w-4 h-4" /> },
    { id: 4, title: "Meeting Notes", type: "folder", lastUpdated: "5d ago", icon: <Folder className="w-4 h-4" /> }
  ]

  // This would be your search results from an actual query
  const searchResults = {
    pages: [
      { id: 1, title: "Development Plan", description: "Tech stack overview and milestones", icon: <FileText className="w-4 h-4" /> },
      { id: 2, title: "Design System", description: "Components and design guidelines", icon: <FileText className="w-4 h-4" /> },
      { id: 3, title: "Marketing Plan Templates", description: "Templates for different campaigns", icon: <FileText className="w-4 h-4" /> }
    ],
    databases: [
      { id: 1, title: "Tasks DB", description: "All project tasks and assignments", icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 2, title: "Content Calendar", description: "Publishing schedule and status", icon: <Calendar className="w-4 h-4" /> }
    ],
    files: [
      { id: 1, title: "Presentation.pdf", description: "Sales pitch deck for new clients", icon: <File className="w-4 h-4" /> },
      { id: 2, title: "Logo Assets.zip", description: "Brand logos in different formats", icon: <File className="w-4 h-4" /> }
    ]
  }

  const categories = [
    { id: "all", name: "All", icon: <Search className="w-4 h-4" /> },
    { id: "pages", name: "Pages", icon: <FileText className="w-4 h-4" /> },
    { id: "databases", name: "Databases", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "files", name: "Files", icon: <File className="w-4 h-4" /> }
  ]


  const showResults = search.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogHeader>
        <VisuallyHidden.Root asChild>
          <DialogTitle>Search</DialogTitle>
        </VisuallyHidden.Root>
      </DialogHeader>
      <DialogContent className="sm:max-w-[650px] p-0 gap-0">
        <div className="flex flex-col h-[600px]">
          <Command className="rounded-t-lg border-none" shouldFilter={false}>
            <div className="flex items-center px-3 border-b">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Search..."
                className="flex h-14 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                value={search}
                onValueChange={setSearch}
              />
              {search && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-muted-foreground" 
                  onClick={() => setSearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Categories section */}
            <div className="border-b">
              <div className="flex items-center gap-2 p-2 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.icon}
                    {category.name}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                  <ListFilter className="w-4 h-4" />
                  Filters
                </Button>
              </div>
            </div>

            <Command.List className="p-0 overflow-hidden">
              <ScrollArea className="h-[450px]">
                {!showResults ? (
                  <>
                    {/* Recent searches */}
                    <div className="px-3 pt-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-between">
                        <span>Recent searches</span>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          Clear
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {recentSearches.map((search) => (
                          <Button 
                            key={search} 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs"
                            onClick={() => setSearch(search)}
                          >
                            {search}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Recent pages */}
                    <div className="px-3 pt-2 pb-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Recent pages
                      </div>
                      <div className="space-y-1">
                        {recentPages.map((page) => (
                          <Command.Item
                            key={page.id}
                            className="px-2 py-1.5 rounded-md cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              {page.icon}
                              <span>{page.title}</span>
                              <Badge variant="outline" className="ml-2 text-xs font-normal">
                                {page.type}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{page.lastUpdated}</span>
                          </Command.Item>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Pages results */}
                    {(selectedCategory === "all" || selectedCategory === "pages") && (
                      <div className="px-3 pt-4 pb-2">
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          Pages
                        </div>
                        <div className="space-y-1">
                          {searchResults.pages.map((result) => (
                            <Command.Item
                              key={result.id}
                              className="px-2 py-2 rounded-md cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {result.icon}
                                <div className="flex flex-col">
                                  <span className="text-sm">{result.title}</span>
                                  <span className="text-xs text-muted-foreground">{result.description}</span>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </Command.Item>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Databases results */}
                    {(selectedCategory === "all" || selectedCategory === "databases") && (
                      <div className="px-3 pt-4 pb-2">
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          Databases
                        </div>
                        <div className="space-y-1">
                          {searchResults.databases.map((result) => (
                            <Command.Item
                              key={result.id}
                              className="px-2 py-2 rounded-md cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {result.icon}
                                <div className="flex flex-col">
                                  <span className="text-sm">{result.title}</span>
                                  <span className="text-xs text-muted-foreground">{result.description}</span>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </Command.Item>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files results */}
                    {(selectedCategory === "all" || selectedCategory === "files") && (
                      <div className="px-3 pt-4 pb-2">
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          Files
                        </div>
                        <div className="space-y-1">
                          {searchResults.files.map((result) => (
                            <Command.Item
                              key={result.id}
                              className="px-2 py-2 rounded-md cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {result.icon}
                                <div className="flex flex-col">
                                  <span className="text-sm">{result.title}</span>
                                  <span className="text-xs text-muted-foreground">{result.description}</span>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </Command.Item>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Create suggestion at the bottom */}
                    <div className="px-3 pt-4 pb-6">
                      <div className="px-2 py-3 rounded-md border border-dashed flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                        <span>Create new page with</span>
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          {search}
                        </kbd>
                      </div>
                    </div>
                  </>
                )}
              </ScrollArea>
            </Command.List>
          </Command>

          {/* Keyboard shortcuts footer */}
          <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ↑
                </kbd>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ↓
                </kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ↵
                </kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  Esc
                </kbd>
                <span>Close</span>
              </div>
            </div>
            <div>
              <span className="text-xs">Press</span>
              <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                Tab
              </kbd>
              <span className="ml-1 text-xs">to filter</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}