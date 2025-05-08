import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, MoreHorizontal, Plus, Folder, FileText, MessageSquare, File, Code, Briefcase, Package } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"; // Assuming these components are available from your shadcn setup
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid'; // Using uuid for unique IDs

// Define the types for our items
interface FileItem {
  id: string;
  name: string;
  type: 'chat' | 'pdf' | 'note' | 'code' | 'folder'| 'file'; // Added 'code' file type
  emoji: React.ReactNode;
}

interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  emoji: React.ReactNode;
  children: (FileItem | FolderItem)[];
}

interface ProjectItem {
  id: string;
  name: string;
  type: 'project';
  emoji: React.ReactNode;
  children: (FileItem | FolderItem)[]; // Projects can contain Folders and Files directly
}

interface SpaceItem {
  id: string;
  name: string;
  type: 'space';
  emoji: React.ReactNode;
  children: ProjectItem[]; // Spaces contain Projects
}

type Item = FileItem | FolderItem | ProjectItem | SpaceItem;

// Drag and Drop Types
const ItemTypes = {
  FILE: 'file',
  FOLDER: 'folder', // Allow dragging folders
};

// Helper function to find an item and its parent by ID
const findItemAndParent = (items: Item[], targetId: string, parent: Item | null = null): { item: Item | undefined, parent: Item | null } => {
  for (const item of items) {
    if (item.id === targetId) {
      return { item, parent };
    }
    if ('children' in item) {
      const result = findItemAndParent(item.children, targetId, item);
      if (result.item) {
        return result;
      }
    }
  }
  return { item: undefined, parent: null };
};

// Helper function to update the tree structure after drag and drop
const moveItem = (items: Item[], itemId: string, targetParentId: string | null, targetIndex: number): Item[] => {
  const newItems = [...items];
  const { item: draggedItem, parent: oldParent } = findItemAndParent(newItems, itemId);

  if (!draggedItem) return newItems;

  // Remove from old parent
  if (oldParent && 'children' in oldParent) {
    // Ensure the children array is treated as mutable for splicing
    if (Array.isArray(oldParent.children)) {
       (oldParent.children as Item[]).splice((oldParent.children as Item[]).findIndex(child => child.id === itemId), 1);
    }
  } else {
    // It was a top-level space, remove from the root array
    const indexToRemove = newItems.findIndex(item => item.id === itemId);
    if (indexToRemove > -1) {
      newItems.splice(indexToRemove, 1);
    }
  }

  // Add to new parent
  if (targetParentId) {
    const { item: newParent } = findItemAndParent(newItems, targetParentId);
    if (newParent && 'children' in newParent) {
       // Type guard to ensure newParent has a children array that can contain the dragged item type
       if (
           (newParent.type === 'space' && draggedItem.type === 'project') ||
           ((newParent.type === 'project' || newParent.type === 'folder') && (draggedItem.type === 'file' || draggedItem.type === 'folder'))
       ) {
          // Ensure the children array is treated as mutable for splicing
          if (Array.isArray(newParent.children)) {
             (newParent.children as Item[]).splice(targetIndex, 0, draggedItem);
          }
       } else {
           console.warn(`Cannot drop item type "${draggedItem.type}" into parent type "${newParent.type}"`);
       }
    }
  } else {
    // Dropping at the root level (only allow spaces here)
    if (draggedItem.type === 'space') {
        newItems.splice(targetIndex, 0, draggedItem);
    } else {
        console.warn(`Cannot drop item type "${draggedItem.type}" at the root level`);
    }
  }

  return newItems;
};


// Component for rendering a single item (Space, Project, Folder, or File)
interface TreeItemProps {
  item: Item;
  level: number;
  workspaces: SpaceItem[];
  onAddItem: (parentId: string | null, type: 'space' | 'project' | 'folder' | 'chat' | 'pdf' | 'note' | 'code') => void;
  onMoveItem: (itemId: string, targetParentId: string | null, targetIndex: number) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({ item, level, workspaces, onAddItem, onMoveItem }) => {
  const router = useRouter();
  const isDraggable = item.type !== 'space'; // Spaces are not draggable in this example, Projects, Folders, and Files are.
  const ref = useRef<HTMLLIElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: item.type === 'file' ? ItemTypes.FILE : ItemTypes.FOLDER, // Drag files or folders
    item: { id: item.id, type: item.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: isDraggable,
  }), [item.id, isDraggable, item.type]);

   const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.FILE, ItemTypes.FOLDER], // Can drop files and folders
    drop: (draggedItem: { id: string; type: 'file' | 'folder' | 'project' }, monitor) => {
      if (!ref.current) {
        return;
      }

      // Prevent dropping an item onto itself
      if (draggedItem.id === item.id) {
          return;
      }

      // Determine the target parent ID
      const targetParentId = 'children' in item ? item.id : (level === 0 ? null : findItemAndParent(workspaces, item.id)?.parent?.id || null);

      // Simple index calculation: drop before or after the current item
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientY = clientOffset ? clientOffset.y - hoverBoundingRect.top : 0;
      const targetIndex = clientY < hoverMiddleY ? 0 : 1; // 0 for before, 1 for after

      // If dropping onto a parent item, add to the beginning of its children
       if ('children' in item && (item.type === 'space' || item.type === 'project' || item.type === 'folder')) {
           onMoveItem(draggedItem.id, item.id, 0); // Drop at the beginning of the target parent's children
       } else if (targetParentId !== undefined) { // If dropping next to an item
           // Find the index of the current item within its parent's children
           const { parent: currentItemParent } = findItemAndParent(workspaces, item.id);
           if (currentItemParent && 'children' in currentItemParent) {
               const currentIndex = (currentItemParent.children as Item[]).findIndex(child => child.id === item.id);
               onMoveItem(draggedItem.id, targetParentId, currentIndex + targetIndex); // Insert before or after the current item
           } else if (targetParentId === null) { // Dropping at the root level
               const currentIndex = workspaces.findIndex((space: SpaceItem) => space.id === item.id);
                onMoveItem(draggedItem.id, null, currentIndex + targetIndex);
           }
       }
    },
    canDrop: (draggedItem) => {
       // Prevent dropping an item onto itself
       if (draggedItem.id === item.id) {
           return false;
       }

       // Define valid drop targets based on item types
       if (draggedItem.type === ItemTypes.FILE) {
           // Files can be dropped into Folders or Projects
           return item.type === 'folder' || item.type === 'project';
       } 
       if (draggedItem.type === ItemTypes.FOLDER) {
           // Folders can be dropped into Projects or other Folders
           return item.type === 'project' || item.type === 'folder';
       }
        // Prevent dropping onto files or spaces (unless it's a project)
       return item.type === 'space' && draggedItem.type === 'project';
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [item.id, level, onMoveItem, item.type]);


  // Apply drag and drop refs
  if (isDraggable) {
      drag(drop(ref));
  } else {
      drop(ref);
  }


  const handleAddItem = (type: 'space' | 'project' | 'folder' | 'chat' | 'pdf' | 'note' | 'code') => {
    onAddItem(item.id, type);
  };

  const renderAddActions = () => {
    switch (item.type) {
      case 'space':
        return (
          <SidebarMenuAction showOnHover onClick={() => handleAddItem('project')}>
            <Plus className="h-4 w-4" /> {/* Add Project */}
          </SidebarMenuAction>
        );
      case 'project':
      case 'folder':
        return (
          <>
            <SidebarMenuAction showOnHover onClick={() => handleAddItem('folder')}>
              <Folder className="h-4 w-4" /> {/* Add Folder */}
            </SidebarMenuAction>
            <SidebarMenuAction showOnHover onClick={() => handleAddItem('chat')}>
              <MessageSquare className="h-4 w-4" /> {/* Add Chat File */}
            </SidebarMenuAction>
            <SidebarMenuAction showOnHover onClick={() => handleAddItem('pdf')}>
              <FileText className="h-4 w-4" /> {/* Add PDF File */}
            </SidebarMenuAction>
             <SidebarMenuAction showOnHover onClick={() => handleAddItem('note')}>
              <File className="h-4 w-4" /> {/* Add Note File */}
            </SidebarMenuAction>
             <SidebarMenuAction showOnHover onClick={() => handleAddItem('code')}>
              <Code className="h-4 w-4" /> {/* Add Code File */}
            </SidebarMenuAction>
          </>
        );
      default:
        return null; // Files don't have add actions
    }
  };


  if ('children' in item) {
    // It's a Space, Project, or Folder
    return (
      <Collapsible key={item.id}>
  <SidebarMenuItem ref={ref} style={{ opacity: isDragging ? 0.5 : 1, borderTop: isOver && canDrop ? '2px dashed #000' : 'none' }}>
          <SidebarMenuButton asChild>
            {/* Use a div or button if not a link */}
            <div className="flex items-center gap-2 cursor-pointer w-full">
              <span>{item.emoji}</span>
              <span>{item.name}</span>
            </div>
          </SidebarMenuButton>
          {(item.type === 'space' || item.type === 'project' || item.type === 'folder') && (
            // Show add actions for Space, Project, and Folder
            <>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction
                  className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
                  showOnHover
                >
                  <ChevronRight className="h-4 w-4" />
                </SidebarMenuAction>
              </CollapsibleTrigger>
              {/* Add actions based on item type */}
              {renderAddActions()}
            </>
          )}
        </SidebarMenuItem>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => (
              <TreeItem
                key={child.id}
                item={child}
                level={level + 1}
                workspaces={workspaces}
                onAddItem={onAddItem}
                onMoveItem={onMoveItem}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    );
  } 
    // It's a File
    return (
      <SidebarMenuSubItem key={item.id} ref={ref} style={{ opacity: isDragging ? 0.5 : 1, borderTop: isOver && canDrop ? '2px dashed #000' : 'none' }}>
        <SidebarMenuSubButton asChild>
          {/* Use a div or button if not a link */}
          <div
            className="flex items-center gap-2 cursor-pointer w-full"
            onClick={() => router.push(`/documents/${item.id}`)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/documents/${item.id}`); }}
          >
            <span>{item.emoji}</span>
            <span>{item.name}</span>
          </div>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
};


export function NavWorkspaces() {
  const [workspaces, setWorkspaces] = useState<SpaceItem[]>([
    {
      id: uuidv4(),
      name: "My Space",
      type: 'space',
      emoji: "🏠", // Using a different emoji for Space
      children: [
        {
          id: uuidv4(),
          name: "Personal Projects",
          type: 'project',
          emoji: <Briefcase className="h-4 w-4" />, // Using a different icon for Project
          children: [
            {
              id: uuidv4(),
              name: "Website Redesign",
              type: 'folder',
              emoji: <Folder className="h-4 w-4" />,
              children: [
                { id: uuidv4(), name: "Design Notes", type: 'note', emoji: <File className="h-4 w-4" /> },
                { id: uuidv4(), name: "Code Snippets", type: 'code', emoji: <Code className="h-4 w-4" /> },
              ],
            },
            { id: uuidv4(), name: "Blog Ideas", type: 'note', emoji: <File className="h-4 w-4" /> },
          ],
        },
         {
          id: uuidv4(),
          name: "Learning Resources",
          type: 'project',
          emoji: <Package className="h-4 w-4" />,
          children: [
             { id: uuidv4(), name: "React Tutorial PDF", type: 'pdf', emoji: <FileText className="h-4 w-4" /> },
             { id: uuidv4(), name: "JS Concepts Chat", type: 'chat', emoji: <MessageSquare className="h-4 w-4" /> },
          ]
         }
      ],
    },
    {
      id: uuidv4(),
      name: "Team Space",
      type: 'space',
      emoji: "🏢",
      children: [
         {
            id: uuidv4(),
            name: "Marketing Campaign",
            type: 'project',
            emoji: <Briefcase className="h-4 w-4" />,
            children: [
                { id: uuidv4(), name: "Campaign Brief", type: 'pdf', emoji: <FileText className="h-4 w-4" /> },
                { id: uuidv4(), name: "Team Chat", type: 'chat', emoji: <MessageSquare className="h-4 w-4" /> },
            ]
         }
      ],
    },
  ]);

  const handleAddItem = (parentId: string | null, type: 'space' | 'project' | 'folder' | 'chat' | 'pdf' | 'note' | 'code') => {
    const newItem: Item = type === 'space' ?
       { id: uuidv4(), name: `New Space ${uuidv4().slice(0, 4)}`, type: 'space', emoji: "✨", children: [] } :
       type === 'project' ?
       { id: uuidv4(), name: `New Project ${uuidv4().slice(0, 4)}`, type: 'project', emoji: <Briefcase className="h-4 w-4" />, children: [] } :
       type === 'folder' ?
      { id: uuidv4(), name: `New Folder ${uuidv4().slice(0, 4)}`, type: 'folder', emoji: <Folder className="h-4 w-4" />, children: [] } :
      { id: uuidv4(), name: `New ${type} ${uuidv4().slice(0, 4)}`, type, emoji: type === 'chat' ? <MessageSquare className="h-4 w-4" /> : type === 'pdf' ? <FileText className="h-4 w-4" /> : type === 'code' ? <Code className="h-4 w-4" /> : <File className="h-4 w-4" /> };

    setWorkspaces(prevWorkspaces => {
      if (parentId === null) {
        // Adding a new space at the root level
        if (newItem.type === 'space') {
           return [...prevWorkspaces, newItem as SpaceItem];
        }
         return prevWorkspaces; // Only allow adding spaces at the root
      } 
        const newWorkspaces = [...prevWorkspaces];
        const { item: parentItem } = findItemAndParent(newWorkspaces, parentId);

        if (parentItem && 'children' in parentItem) {
           // Type guard to ensure the parent can accept the new item type
           if (
               (parentItem.type === 'space' && newItem.type === 'project') ||
               ((parentItem.type === 'project' || parentItem.type === 'folder') && (newItem.type === 'folder' || newItem.type === 'chat' || newItem.type === 'pdf' || newItem.type === 'note' || newItem.type === 'code'))
           ) {
              (parentItem.children as Item[]).push(newItem);
           } else {
              console.warn(`Cannot add item type "${newItem.type}" to parent type "${parentItem.type}"`);
           }
        }
        return newWorkspaces;
    });
  };

   const handleMoveItem = (itemId: string, targetParentId: string | null, targetIndex: number) => {
      setWorkspaces(prevWorkspaces => {
         const newWorkspaces = moveItem(prevWorkspaces, itemId, targetParentId, targetIndex) as SpaceItem[];
         return newWorkspaces;
      });
   };


  return (
    <DndProvider backend={HTML5Backend}>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
           Spaces
           <SidebarMenuAction onClick={() => handleAddItem(null, 'space')} className="ml-auto"> {/* Add action for Spaces group */}
              <Plus className="h-4 w-4" />
           </SidebarMenuAction>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {workspaces.map((space) => (
              <TreeItem
                key={space.id}
                item={space}
                level={0}
                workspaces={workspaces}
                onAddItem={handleAddItem}
                onMoveItem={handleMoveItem}
              />
            ))}
             <SidebarMenuItem>
              <SidebarMenuButton className="text-sidebar-foreground/70">
                <MoreHorizontal className="h-4 w-4" />
                <span>More</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </DndProvider>
  );
}

