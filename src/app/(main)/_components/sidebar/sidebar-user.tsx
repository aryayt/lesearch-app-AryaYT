"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDownIcon, PlusIcon, ImportIcon, FilePlusIcon, FolderPlusIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";
import UserPopover from "../popover/user-popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { PDFImport } from "../pdfviewer/pdf-import";
import { useStore } from "@/store/useCollectionStore";

export default function SidebarUser() {
  const { fullname, image, email } = useUserStore();
  const [importPdfOpen, setImportPdfOpen] = useState(false);
  const { setCreation } = useStore();

  return (
    <div className="flex items-center justify-between w-full">
      <UserPopover fullname={fullname} username={email} image={image}>
        {!fullname ? (
          <Skeleton className="mb-1 h-8 w-full bg-primary/5" />
        ) : (
          <Button
            variant="ghost"
            size="lg"
            className="flex h-[24px] items-center justify-start  gap-x-2  md:h-8"
          >
            <Avatar className="w-6 h-6">
              <AvatarImage src={image || ""} alt={fullname[0]} loading="lazy" />
              <AvatarFallback>
                {fullname ? fullname[0].toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>

            <p className="mr-1 max-w-[250px] truncate capitalize md:max-w-[120px]">
              {fullname}
            </p>

            <ChevronsUpDownIcon className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
      </UserPopover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 "
          >
            <PlusIcon className="h-4 w-4" />
            <span className="sr-only">Add menu</span>
          </Button>
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
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => setCreation({ parentId: null, type: "space" })}>
            <FolderPlusIcon className="h-4 w-4" />
            <span>Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {importPdfOpen && <PDFImport isOpen={importPdfOpen} onClose={() => setImportPdfOpen(false)} />}
    </div>
  );
}