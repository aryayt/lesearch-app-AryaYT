"use client"

import {
  ChevronsUpDown,
  LogOutIcon,
  Moon,
  Settings2Icon,
  Sun,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useUserStore } from "@/store/userStore"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes";
import { SettingsDialog } from "../dialog/settings-dialog"
import SignOutDialog from "../dialog/signout-dialog"
export default function SidebarUser() {
  const { isMobile } = useSidebar()
  const { fullname, image, email } = useUserStore();
    const { resolvedTheme: theme, setTheme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {fullname && <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={image || ""} alt={fullname || ""} />
                <AvatarFallback className="rounded-lg">{fullname ? fullname[0].toUpperCase() : "?"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullname}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={image || ""} alt={fullname || ""} />
                  <AvatarFallback className="rounded-lg">{fullname ? fullname[0].toUpperCase() : "?"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{fullname}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="w-72">
          <section className="border-b p-2"> 
            <div className="grid grid-cols-2 gap-2">
              <SettingsDialog>
              <Button
                variant="outline"
                size="sm"
                className="h-8 justify-start px-2 text-xs font-normal"
              >
                <Settings2Icon className="mr-2 h-4 w-4" />
                Settings
              </Button>
              </SettingsDialog>
              <Button
                variant="outline"
                size="sm"
                className="h-8 justify-start px-2 text-xs font-normal"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>
          </section>

          <section className="w-full p-1">
            <SignOutDialog>
              <Button
                variant="ghost"
                className="h-8 w-full justify-start px-2 text-xs font-normal"
              >
                <LogOutIcon className="mr-3 h-4 w-4" />
                Log out
              </Button>
            </SignOutDialog>
          </section>
        </div>
        </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
