"use client";

import { useState, useEffect,type PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Search,
  Settings,
  Star,
  MessageSquareText,
  Menu,
  X,
  HelpCircle,
  MessageSquare,
  PenBox,
  Home,
  User as UserIcon,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

// Shadcn components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import type{ User } from "@supabase/supabase-js";


// Menu item interface
interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

export default function LayoutWrapper({
    children,
    currentUser,
  }: PropsWithChildren & {
    currentUser: User;
  }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const name = currentUser.user_metadata.fullName || currentUser.email;
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Calculate if menu item is active
  const isMenuItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Main navigation menu items
  const mainMenuItems: MenuItem[] = [
    {
      icon: <Home size={20} />,
      label: "Home",
      href: "/",
      isActive: isMenuItemActive("/"),
    },
    {
      icon: <Star size={20} />,
      label: "Favorites",
      href: "/favorites",
      isActive: isMenuItemActive("/favorites"),
    },
    {
      icon: <MessageSquareText size={20} />,
      label: "Ask AI",
      href: "/ask-ai",
      isActive: isMenuItemActive("/ask-ai"),
    },
  ];

  // Secondary menu items
  const secondaryMenuItems: MenuItem[] = [
    {
      icon: <Settings size={20} />,
      label: "Settings",
      href: "/settings",
      isActive: isMenuItemActive("/settings"),
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Support",
      href: "/support",
      isActive: isMenuItemActive("/support"),
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Feedback",
      href: "/feedback",
      isActive: isMenuItemActive("/feedback"),
    },
  ];

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logout clicked");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-muted/10 transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          {!isSidebarCollapsed && (
            <span className="font-semibold">Dashboard</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="ml-auto"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform",
                isSidebarCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Search input */}
        <div className="p-4">
          {isSidebarCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="w-full">
                    <Search size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Search</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {mainMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isSidebarCollapsed && "justify-center"
                  )}
                >
                  {item.icon}
                  {!isSidebarCollapsed && (
                    <span className="ml-2">{item.label}</span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </nav>

        {/* Secondary navigation */}
        <div className="mt-auto p-2">
          <div className="space-y-1">
            {secondaryMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {isSidebarCollapsed ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={item.isActive ? "secondary" : "ghost"}
                          className="w-full justify-center"
                        >
                          {item.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    variant={item.isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* User profile at bottom */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full",
                  isSidebarCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={currentUser.user_metadata.avatar_url}
                    alt={currentUser.user_metadata.fullName || currentUser.email}
                  />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed && (
                  <span className="ml-2 text-sm truncate">
                    {currentUser.user_metadata.fullName || currentUser.email}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex w-full items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer flex w-full items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <span className="font-semibold">Dashboard</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <nav className="p-2">
            <div className="space-y-1">
              {mainMenuItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant={item.isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </nav>

          <div className="mt-4 border-t p-2">
            <div className="space-y-1">
              {secondaryMenuItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant={item.isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t p-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={currentUser.user_metadata.avatar_url}
                  alt={currentUser.user_metadata.fullName || currentUser.email}
                />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {currentUser.user_metadata.fullName || currentUser.email}
                </p>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 px-2 text-xs text-muted-foreground">
                  <LogOut className="mr-2 h-3 w-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center border-b px-4 md:px-6">
         
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden"
          >
            <Menu size={20} />
          </Button>
          
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <PenBox className="mr-2 h-4 w-4" />
              New
            </Button>
            
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={currentUser.user_metadata.avatar_url}
                        alt={currentUser.user_metadata.fullName || currentUser.email}
                      />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex w-full items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}