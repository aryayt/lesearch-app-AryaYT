"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { Search, Sparkles, Home, Plus, ImportIcon, FilePlusIcon, FolderPlusIcon } from "lucide-react"
import { SearchDialog } from "../dialog/searchDialog" // Adjust this path as needed
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react";
import { useStore } from "@/store/useCollectionStore";
import { PDFImport } from "../pdfviewer/pdf-import"

export function NavMain() {
   const pathname = usePathname()
  const isHome = pathname === "/documents" || pathname === "/documents/"
  const isAskAI = pathname === "/askAI" || pathname === "/askAI/"
  const isGraphView = pathname === "/graphview" || pathname === "/graphview/"
  const [importPdfOpen, setImportPdfOpen] = useState(false);
  const { setCreation } = useStore();
  return (
    <SidebarMenu>
      {/* Search Item */}
      <SidebarMenuItem title="Create">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton>
            <Plus />
            <span>Add Files</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setImportPdfOpen(true)}
          >
            <ImportIcon className="h-4 w-4" />
            <span>Import PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => setCreation({ parentId: null, type: "note" })}>
            <FilePlusIcon className="h-4 w-4" />
            <span>Create Page</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => setCreation({ parentId: null, type: "folder" })}>
            <FolderPlusIcon className="h-4 w-4" />
            <span>Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {importPdfOpen && <PDFImport isOpen={importPdfOpen} onClose={() => setImportPdfOpen(false)} />}
      </SidebarMenuItem>
      <SidebarMenuItem title="Search">
        <SearchDialog>
          <SidebarMenuButton>
            <Search />
            <span>Search</span>
          </SidebarMenuButton>
        </SearchDialog>
      </SidebarMenuItem>

      {/* Ask AI Item */}
      <SidebarMenuItem title="Lesearch AI">
        <SidebarMenuButton asChild isActive={isAskAI}>
          <Link href="/askAI">
            <Sparkles />
            <span>Lesearch AI</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Home Item */}
      <SidebarMenuItem title="Home">
        <SidebarMenuButton asChild isActive={isHome}>
          <Link href="/">
            <Home />
            <span>Home</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Inbox Item */}
      <SidebarMenuItem title="GraphView">
        <SidebarMenuButton asChild isActive={isGraphView}>
          <Link href="/graphview">
          <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          className="w-4 h-4"
        >
          {/* Nodes arranged in hexagonal pattern */}
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
          <circle cx="17" cy="9" r="1.5" fill="currentColor" />
          <circle cx="17" cy="15" r="1.5" fill="currentColor" />
          <circle cx="12" cy="18" r="1.5" fill="currentColor" />
          <circle cx="7" cy="15" r="1.5" fill="currentColor" />
          <circle cx="7" cy="9" r="1.5" fill="currentColor" />

          {/* Connections between nodes */}
          <line
            x1="12"
            y1="6"
            x2="17"
            y2="9"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="12"
            y1="6"
            x2="7"
            y2="9"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="12"
            y1="6"
            x2="12"
            y2="12"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="17"
            y1="9"
            x2="17"
            y2="15"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="17"
            y1="15"
            x2="12"
            y2="18"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="12"
            y1="12"
            x2="7"
            y2="15"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="12"
            y1="12"
            x2="17"
            y2="15"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="7"
            y1="9"
            x2="7"
            y2="15"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
            <span>GraphView</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}