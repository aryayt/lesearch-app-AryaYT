"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { NavActions } from "./nav-actions";
import { usePathname } from "next/navigation";

const Header = function Header() {
  const pathname = usePathname();
  const isDocumentPage = pathname.startsWith("/documents") && pathname !== "/documents";
  return (
    <header className="flex sticky top-0 bg-background h-10 shrink-0 items-end gap-2  px-2 z-20">
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger />
        {isDocumentPage &&<>
        <Separator orientation="vertical" className="mr-1 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">
                Documents
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        </>}
      </div>
      {isDocumentPage &&<div className="ml-auto flex px-3 relative ">
        <NavActions />
      </div>}
    </header>
  );
};

export default Header;
