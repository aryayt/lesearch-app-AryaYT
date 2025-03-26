"use client";

import SignOutDialog from "../dialog/signout-dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LogOutIcon,
  Settings2Icon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {type  PropsWithChildren, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { SettingsDialog } from "../dialog/settings-dialog";


type Props = PropsWithChildren & {
  fullname: string | null;
  username: string | null;
  image: string | null;
};

export default function UserPopover({
  children,
  fullname,
  username,
  image,
}: Props) {
  const pathname = usePathname();
  const ref = useRef<HTMLButtonElement | null>(null);
  const { resolvedTheme: theme, setTheme } = useTheme();



  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        asChild
        className="overflow-hidden p-0"
        side="bottom"
        align={pathname === "/" ? "end" : "start"}
        alignOffset={pathname === "/" ? 0 : 8}
      >
        <div className="w-72">
          <section className="border-b p-3">
            <div className="flex gap-x-2 pr-1">
              <Avatar className="rounded-md">
                <AvatarImage
                  src={image || ""}
                  alt={fullname ? fullname[0] : ""}
                  loading="lazy"
                />
                <AvatarFallback>
                  {fullname ? fullname[0].toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>

              {(fullname || username) && (
                <div className="flex flex-col">
                  <p className="text-sm capitalize ">{fullname}&apos;s Space</p>
                  <p className="text-xs text-muted-foreground">@{username}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
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

          <PopoverClose hidden asChild>
            <button type="button" ref={ref}>close</button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}