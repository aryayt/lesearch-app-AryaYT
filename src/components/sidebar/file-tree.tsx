import * as React from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { FileNode } from "./file-node"
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"
import { MoreHorizontal } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { nanoid } from "nanoid"
import type { Creation } from "@/app/(main)/_components/sidebar/nav-workspaces"

export type FileItem = {
  id: string
  name: string
  parentId: string | null
  type: "space" | "project" | "folder" | "file"
  folderType?: "chat" | "file" | "notes"
}

type FileTreeProps = {
  files: FileItem[]
  className?: string
  onUpdate?: (files: FileItem[]) => void
  setCreation: (creation: Creation | null) => void
  creation: Creation
}

export function FileTree({ files, className, onUpdate, setCreation, creation }: FileTreeProps) {
  const [items, setItems] = React.useState<FileItem[]>(files)
  const [draggedItem, setDraggedItem] = React.useState<FileItem | null>(null)
  const [dropTarget, setDropTarget] = React.useState<string | null>(null)
  const [newName, setNewName] = React.useState("")

  React.useEffect(() => {
    setItems(files)
  }, [files])

  React.useEffect(() => {
    onUpdate?.(items)
  }, [items, onUpdate])

  const handleCreate = () => {
    if (!creation || !newName.trim()) return
    const id = nanoid()
    setItems([
      ...items,
      { id, name: newName, parentId: creation.parentId, type: creation.type, folderType: creation.folderType },
    ])
    setNewName("")
    setCreation(null)
  }

  const getFileHierarchy = (fileList: FileItem[]) => {
    const rootFiles = fileList.filter((file) => file.parentId === null)
    const getChildFiles = (parentId: string) => fileList.filter((file) => file.parentId === parentId)
    return { rootFiles, getChildFiles }
  }

  const { rootFiles, getChildFiles } = getFileHierarchy(items)

  const handleDragStart = (e: React.DragEvent, item: FileItem) => {
    e.stopPropagation()
    setDraggedItem(item)
    e.dataTransfer.setData("application/json", JSON.stringify(item))
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDropTarget(null)
  }

  const isDescendant = (sourceId: string, targetId: string): boolean => {
    if (sourceId === targetId) return true
    const findDesc = (id: string): string[] => {
      const children = items.filter((i) => i.parentId === id)
      return children.length === 0 ? [] : [...children.map((c) => c.id), ...children.flatMap((c) => findDesc(c.id))]
    }
    return findDesc(sourceId).includes(targetId)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedItem || draggedItem.id === targetId) return
    if (isDescendant(draggedItem.id, targetId)) {
      toast.error("Cannot move a file into its own child")
      return
    }
    setItems((prev) => prev.map((i) => (i.id === draggedItem.id ? { ...i, parentId: targetId } : i)))
    toast.success(`Moved \"${draggedItem.name}\" under \"${items.find((i) => i.id === targetId)?.name}\"`)
  }

  const handleRootDrop = (e: React.DragEvent) => {
    // only trigger when dropping directly on container, not its children
    if (e.target !== e.currentTarget) return
    e.preventDefault()
    e.stopPropagation()
    if (!draggedItem) return
    setItems((prev) => prev.map((i) => (i.id === draggedItem.id ? { ...i, parentId: null } : i)))
    toast.success(`Moved "${draggedItem.name}" to root level`)
  }

  const handleRootDragOver = (e: React.DragEvent) => {
    // only allow if dragging and target is container
    if (e.target !== e.currentTarget) return
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      className={cn("w-full min-h-[100px] p-2", className)}
      onDragOver={handleRootDragOver}
      onDrop={handleRootDrop}
    >
      {rootFiles.map((file) => (
        <FileNode
          key={file.id}
          file={file}
          level={0}
          childFiles={getChildFiles(file.id)}
          getChildFiles={getChildFiles}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          draggedItem={draggedItem}
          setDropTarget={setDropTarget}
          dropTarget={dropTarget}
          isDraggable={file.type === "folder" || file.type === "file"}
          defaultOpen={false}
          onRequestCreate={(newItem) => setCreation(newItem)}
        />
      ))}
      <SidebarMenuItem>
        <SidebarMenuButton className="text-sidebar-foreground/70">
          <MoreHorizontal />
          <span>More</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Dialog open={!!creation} onOpenChange={(open) => open || setCreation(null)}>
        <DialogContent>
          <DialogTitle>
            {creation
              ? creation.type === "space"
                ? "New Space"
                : creation.type === "project"
                ? "New Project"
                : creation.type === "folder"
                ? "New Folder"
                : "New File"
              : ""}
          </DialogTitle>
          <div className="space-y-4">
            <Input placeholder="Enter title…" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
