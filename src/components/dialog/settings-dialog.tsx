"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useLayoutStore, SettingsSection } from "@/store/layoutStore"

import { ModelsSection } from "./sections/models-section"
import { AccountSection } from "./sections/account-section"
import { AppearanceSection } from "./sections/appearance-section"
import { NotificationsSection } from "./sections/notifications-section"
import { PrivacySection } from "./sections/privacy-section"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Settings, Link, Globe, Bell, MessageCircle, Paintbrush, Shield, User, Keyboard, Lock } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"


// Navigation items for the sidebar
interface NavItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  id: string;
}

const navItems: NavItem[] = [
  { name: "Account", icon: User, id: "account" },
  { name: "Models", icon: Settings, id: "models" },
  { name: "Appearance", icon: Paintbrush, id: "appearance" },
  { name: "Notifications", icon: Bell, id: "notifications" },
  { name: "Security", icon: Shield, id: "security" },
  { name: "Messages & media", icon: MessageCircle, id: "messages" },
  { name: "Language & region", icon: Globe, id: "language" },
  { name: "Accessibility", icon: Keyboard, id: "accessibility" },
  { name: "Connected accounts", icon: Link, id: "connected" },
  { name: "Privacy & visibility", icon: Lock, id: "privacy" },
  { name: "Advanced", icon: Settings, id: "advanced" },
]


interface UserSettings {
  // Account settings
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  avatar: string;

  // Appearance settings
  theme: string;
  showAvatars: boolean;
  compactMode: boolean;
  fontSize: string;
  // Notification settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  notificationFrequency: string;
  notifyOnMention: boolean;
  notifyOnReply: boolean;
  notifyOnNewMessage: boolean;
  // Privacy settings
  profileVisibility: string;
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  dataCollection: boolean;
  analyticsEnabled: boolean;
  searchableProfile: boolean;
  // Billing settings
  plan: string;
  paymentMethod: {
    type: string;
    last4: string;
    expiry: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  autoRenew: boolean;
}


export function SettingsDialog() {
  const { settingsOpen, activeSettingsSection, setSettingsOpen, setActiveSettingsSection } = useLayoutStore()
  const [settings, setSettings] = React.useState<UserSettings>({
    // Account settings
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    bio: "",
    avatar: "",
    // Appearance settings
    theme: "system",
    showAvatars: true,
    compactMode: false,
    fontSize: "medium",
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    notificationFrequency: "realtime",
    notifyOnMention: true,
    notifyOnReply: true,
    notifyOnNewMessage: true,
    // Privacy settings
    profileVisibility: "public",
    showOnlineStatus: true,
    allowDirectMessages: true,
    dataCollection: true,
    analyticsEnabled: true,
    searchableProfile: true,
    // Billing settings
    plan: "free",
    paymentMethod: {
      type: "credit_card",
      last4: "4242",
      expiry: "12/24"
    },
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: ""
    },
    autoRenew: true
  })

  const handleSettingsChange = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const handleSave = async (sectionData: Partial<UserSettings>) => {
    // Here you would typically make an API call to save the settings
    console.log("Saving settings:", sectionData)
    // For now, we'll just update the local state
    handleSettingsChange(sectionData)
  }

  return(
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[600px] md:max-w-[800px] lg:max-w-[900px]">
      <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider>
        <Sidebar className="h-[580px] border-r">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => setActiveSettingsSection(item.id as SettingsSection)}
                            isActive={item.id === activeSettingsSection}
                          >
                            <item.icon className="h-4 w-4 mr-2" />
                            <span>{item.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <main className="flex h-[580px] flex-1 flex-col overflow-hidden">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
                <div className="flex items-center gap-2">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {navItems.find(item => item.id === activeSettingsSection)?.name}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-4">
                {activeSettingsSection === "account" && (
                  <AccountSection 
                    userSettings={settings} 
                    onSave={handleSave} 
                    onSettingsChange={handleSettingsChange} 
                  />
                )}
                {activeSettingsSection === "models" && (
                  <ModelsSection />
                )}
                {activeSettingsSection === "appearance" && (
                  <AppearanceSection 
                    userSettings={settings} 
                    onSave={handleSave} 
                    onSettingsChange={handleSettingsChange} 
                  />
                )}
                {activeSettingsSection === "notifications" && (
                  <NotificationsSection 
                    userSettings={settings} 
                    onSave={handleSave} 
                    onSettingsChange={handleSettingsChange} 
                  />
                )}
                {activeSettingsSection === "privacy" && (
                  <PrivacySection 
                    userSettings={settings} 
                    onSave={handleSave} 
                    onSettingsChange={handleSettingsChange} 
                  />
                )}
              </div>
            </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )

}
