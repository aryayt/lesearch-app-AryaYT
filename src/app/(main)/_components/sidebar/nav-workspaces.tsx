import * as React from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { type FileItem, FileTree } from "@/components/sidebar/file-tree"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

const initialFiles:  FileItem[] = [
  // SPACES
  { id: "space-1", name: "Marketing", parentId: null, type: "space" },
  { id: "space-2", name: "Engineering", parentId: null, type: "space" },

  // PROJECTS under Marketing
  { id: "project-1", name: "Product Launch", parentId: "space-1", type: "project" },
  { id: "project-2", name: "Campaigns", parentId: "space-1", type: "project" },

  // PROJECTS under Engineering
  { id: "project-3", name: "AI Integration", parentId: "space-2", type: "project" },

  // Default folders under Product Launch
  { id: "project-1-chat", name: "Chat", parentId: "project-1", type: "folder", folderType: "chat" },
  { id: "project-1-file", name: "Files", parentId: "project-1", type: "folder", folderType: "file" },
  { id: "project-1-notes", name: "Notes", parentId: "project-1", type: "folder", folderType: "notes" },

  // Files inside Product Launch folders
  { id: "chat-1", name: "Team Discussion", parentId: "project-1-chat", type: "file" },
  { id: "file-1", name: "LaunchChecklist.pdf", parentId: "project-1-file", type: "file" },
  { id: "note-1", name: "Meeting Summary", parentId: "project-1-notes", type: "file" },

  // Default folders under Campaigns
  { id: "project-2-chat", name: "Chat", parentId: "project-2", type: "folder", folderType: "chat" },
  { id: "project-2-file", name: "Files", parentId: "project-2", type: "folder", folderType: "file" },
  { id: "project-2-notes", name: "Notes", parentId: "project-2", type: "folder", folderType: "notes" },

  // No files in Campaigns yet — empty folders

  // Default folders under AI Integration
  { id: "project-3-chat", name: "Chat", parentId: "project-3", type: "folder", folderType: "chat" },
  { id: "project-3-file", name: "Files", parentId: "project-3", type: "folder", folderType: "file" },
  { id: "project-3-notes", name: "Notes", parentId: "project-3", type: "folder", folderType: "notes" },

  // Files in AI Integration
  { id: "file-2", name: "Design Doc", parentId: "project-3-file", type: "file" },
  { id: "chat-2", name: "Slack Export", parentId: "project-3-chat", type: "file" },
  { id: "note-2", name: "Dev Sync Notes", parentId: "project-3-notes", type: "file" },
]

export type Creation = {
  parentId: string | null
  type: FileItem["type"]
  folderType?: FileItem["folderType"]
} | null

export function NavWorkspaces() {
  const [files, setFiles] = useState<FileItem[]>(initialFiles)
   const [creation, setCreation] = React.useState<Creation>(null)
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden select-none">
      <SidebarGroupLabel className="flex items-center justify-between">
  Workspaces
  <Button
    size="icon"
    variant="ghost"
    onClick={() => setCreation({ parentId: null, type: "space" })}
  >
    <PlusIcon />
  </Button>
</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <FileTree files={files} onUpdate={setFiles} creation={creation} setCreation={setCreation}/>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

