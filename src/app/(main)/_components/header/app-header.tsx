"use client";

import { CustomSidebarTrigger } from "./custom-sidebar-trigger";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { NavActions } from "../sidebar/nav-actions";

const Header = function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2">
    <div className="flex flex-1 items-center gap-2 px-3">
      <CustomSidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">
              Project Management & Task Tracking
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <div className="ml-auto px-3">
      <NavActions />
    </div>
  </header>
  );
};

export default Header;
