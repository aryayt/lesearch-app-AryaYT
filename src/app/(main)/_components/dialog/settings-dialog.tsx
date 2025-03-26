"use client"

import * as React from "react"
import {
  Bell,
  Globe,
  Keyboard,
  Link,
  Lock,
  MessageCircle,
  Paintbrush,
  Settings,
  User,
  Shield,
  Save,
  UploadCloud,
  Eye,
  EyeOff
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Navigation items for the sidebar
interface NavItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  id: string;
}

const navItems: NavItem[] = [
  { name: "Account", icon: User, id: "account" },
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

// Types for user settings
interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  profileImage: string;
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    updates: boolean;
    digest: boolean;
    desktop: boolean;
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  language: string;
  region: string;
  theme: string;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    screenReader: boolean;
  };
  privacy: {
    profileVisibility: string;
    activityStatus: boolean;
    readReceipts: boolean;
    dataCollection: boolean;
  };
  messages: {
    autoplay: boolean;
    imageQuality: string;
    linkPreviews: boolean;
    readReceipts: boolean;
  };
}

interface SettingsDialogProps {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsDialog({ children, onOpenChange }: SettingsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState("account")
  const { resolvedTheme: theme, setTheme } = useTheme()
  const [showPassword, setShowPassword] = React.useState(false)
  const [userSettings, setUserSettings] = React.useState<UserSettings>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    bio: "Software developer and tech enthusiast",
    profileImage: "/api/placeholder/128/128",
    notifications: {
      email: true,
      push: true,
      mentions: true,
      updates: false,
      digest: true,
      desktop: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: "30",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    language: "english",
    region: "united-states",
    theme: theme || "system",
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReader: false
    },
    privacy: {
      profileVisibility: "public",
      activityStatus: true,
      readReceipts: true,
      dataCollection: false
    },
    messages: {
      autoplay: true,
      imageQuality: "high",
      linkPreviews: true,
      readReceipts: true
    }
  })

  const handleOpenChange = (newOpen: boolean): void => {
    setOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  const handleSave = (section: string, data: Partial<UserSettings>): void => {
    setUserSettings(prev => ({
      ...prev,
      ...data
    }))
    // Here you would typically send this data to your backend
    console.log(`Saved ${section} settings:`, data)
  }

  const updateTheme = (newTheme: string): void => {
    setTheme(newTheme)
    setUserSettings(prev => ({
      ...prev,
      theme: newTheme
    }))
  }

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean): void => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const updateSecuritySetting = (key: keyof UserSettings['security'], value: string | boolean): void => {
    setUserSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }))
  }

  const updateAccessibilitySetting = (key: keyof UserSettings['accessibility'], value: boolean): void => {
    setUserSettings(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: value
      }
    }))
  }

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: string | boolean): void => {
    setUserSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const updateMessagesSetting = (key: keyof UserSettings['messages'], value: string | boolean): void => {
    setUserSettings(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [key]: value
      }
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
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
                          onClick={() => setActiveSection(item.id)}
                          isActive={item.id === activeSection}
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
                        {navItems.find(item => item.id === activeSection)?.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-4">
              {/* Account Section */}
              {activeSection === "account" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={userSettings.profileImage} alt={`${userSettings.firstName} ${userSettings.lastName}`} />
                        <AvatarFallback>{userSettings.firstName[0]}{userSettings.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Change Image
                      </Button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={userSettings.firstName} 
                            onChange={(e) => setUserSettings({...userSettings, firstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={userSettings.lastName} 
                            onChange={(e) => setUserSettings({...userSettings, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={userSettings.email} 
                            onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={userSettings.username} 
                            onChange={(e) => setUserSettings({...userSettings, username: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          value={userSettings.bio} 
                          onChange={(e) => setUserSettings({...userSettings, bio: e.target.value})}
                          className="h-20"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("account", {
                      firstName: userSettings.firstName,
                      lastName: userSettings.lastName,
                      email: userSettings.email,
                      username: userSettings.username,
                      bio: userSettings.bio
                    })}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {/* Appearance Section */}
{activeSection === "appearance" && (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Theme</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className={`cursor-pointer ${userSettings.theme === 'light' ? 'border-primary' : 'border-border'}`} onClick={() => updateTheme('light')}>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Light</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-20 rounded-md bg-white border border-gray-200 relative">
              <div className="absolute top-2 left-2 w-8 h-2 bg-gray-300 rounded" />
              <div className="absolute top-6 left-2 w-12 h-2 bg-gray-200 rounded" />
              <div className="absolute top-10 left-2 w-6 h-2 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${userSettings.theme === 'dark' ? 'border-primary' : 'border-border'}`} onClick={() => updateTheme('dark')}>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Dark</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-20 rounded-md bg-gray-900 border border-gray-800 relative">
              <div className="absolute top-2 left-2 w-8 h-2 bg-gray-700 rounded" />
              <div className="absolute top-6 left-2 w-12 h-2 bg-gray-800 rounded" />
              <div className="absolute top-10 left-2 w-6 h-2 bg-gray-800 rounded" />
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${userSettings.theme === 'system' ? 'border-primary' : 'border-border'}`} onClick={() => updateTheme('system')}>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">System</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-20 rounded-md bg-gradient-to-r from-white to-gray-900 border border-gray-200 relative">
              <div className="absolute top-2 left-2 w-8 h-2 bg-gradient-to-r from-gray-300 to-gray-700 rounded" />
              <div className="absolute top-6 left-2 w-12 h-2 bg-gradient-to-r from-gray-200 to-gray-800 rounded" />
              <div className="absolute top-10 left-2 w-6 h-2 bg-gradient-to-r from-gray-200 to-gray-800 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Customization</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="showAvatars">Show Avatars</Label>
            <p className="text-sm text-muted-foreground">Display user avatars in conversations</p>
          </div>
          <Switch id="showAvatars" checked={true} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="compactMode">Compact Mode</Label>
            <p className="text-sm text-muted-foreground">Reduce spacing between elements</p>
          </div>
          <Switch id="compactMode" checked={false} />
        </div>
      </div>
    </div>
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Font Size</h3>
      <div className="w-full max-w-xs">
        <Select defaultValue="medium">
          <SelectTrigger>
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div className="flex justify-end">
      <Button onClick={() => handleSave("appearance", { theme: userSettings.theme })}>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  </div>
)}

{/* Notifications Section */}
{activeSection === "notifications" && (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch 
            id="emailNotifications" 
            checked={userSettings.notifications.email}
            onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="pushNotifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
          </div>
          <Switch 
            id="pushNotifications" 
            checked={userSettings.notifications.push}
            onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="mentionNotifications">Mentions</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
          </div>
          <Switch 
            id="mentionNotifications" 
            checked={userSettings.notifications.mentions}
            onCheckedChange={(checked) => updateNotificationSetting('mentions', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="updateNotifications">Product Updates</Label>
            <p className="text-sm text-muted-foreground">Get notified about new features and updates</p>
          </div>
          <Switch 
            id="updateNotifications" 
            checked={userSettings.notifications.updates}
            onCheckedChange={(checked) => updateNotificationSetting('updates', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="digestNotifications">Weekly Digest</Label>
            <p className="text-sm text-muted-foreground">Receive a weekly summary of activities</p>
          </div>
          <Switch 
            id="digestNotifications" 
            checked={userSettings.notifications.digest}
            onCheckedChange={(checked) => updateNotificationSetting('digest', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="desktopNotifications">Desktop Notifications</Label>
            <p className="text-sm text-muted-foreground">Show notifications on your desktop</p>
          </div>
          <Switch 
            id="desktopNotifications" 
            checked={userSettings.notifications.desktop}
            onCheckedChange={(checked) => updateNotificationSetting('desktop', checked)}
          />
        </div>
      </div>
    </div>
    <div className="flex justify-end">
      <Button onClick={() => handleSave("notifications", { notifications: userSettings.notifications })}>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  </div>
)}

{/* Security Section */}
{activeSection === "security" && (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Account Security</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
          </div>
          <Switch 
            id="twoFactorAuth" 
            checked={userSettings.security.twoFactor}
            onCheckedChange={(checked) => updateSecuritySetting('twoFactor', checked)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">Session Timeout</Label>
          <p className="text-sm text-muted-foreground">Automatically log out after a period of inactivity</p>
          <Select 
            value={userSettings.security.sessionTimeout}
            onValueChange={(value) => updateSecuritySetting('sessionTimeout', value)}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select timeout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="240">4 hours</SelectItem>
              <SelectItem value="0">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Change Password</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input 
              id="currentPassword" 
              type={showPassword ? "text" : "password"}
              value={userSettings.security.currentPassword}
              onChange={(e) => updateSecuritySetting('currentPassword', e.target.value)}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="absolute right-0 top-0 h-full px-3" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input 
              id="newPassword" 
              type={showPassword ? "text" : "password"}
              value={userSettings.security.newPassword}
              onChange={(e) => updateSecuritySetting('newPassword', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              type={showPassword ? "text" : "password"}
              value={userSettings.security.confirmPassword}
              onChange={(e) => updateSecuritySetting('confirmPassword', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
    
    <div className="flex justify-end">
      <Button onClick={() => handleSave("security", { security: userSettings.security })}>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  </div>
)}

{/* Messages & Media Section */}
{activeSection === "messages" && (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Message Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="linkPreviews">Link Previews</Label>
            <p className="text-sm text-muted-foreground">Show previews for links shared in messages</p>
          </div>
          <Switch 
            id="linkPreviews" 
            checked={userSettings.messages.linkPreviews}
            onCheckedChange={(checked) => updateMessagesSetting('linkPreviews', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="readReceipts">Read Receipts</Label>
            <p className="text-sm text-muted-foreground">Let others know when you&apos;ve read their messages</p>
          </div>
          <Switch 
            id="readReceipts" 
            checked={userSettings.messages.readReceipts}
            onCheckedChange={(checked) => updateMessagesSetting('readReceipts', checked)}
          />
        </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Media Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="autoplayMedia">Autoplay Media</Label>
            <p className="text-sm text-muted-foreground">Automatically play videos and GIFs</p>
          </div>
          <Switch 
            id="autoplayMedia" 
            checked={userSettings.messages.autoplay}
            onCheckedChange={(checked) => updateMessagesSetting('autoplay', checked)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="imageQuality">Image Quality</Label>
          <p className="text-sm text-muted-foreground">Set the quality of images in chats</p>
          <Select 
            value={userSettings.messages.imageQuality}
            onValueChange={(value) => updateMessagesSetting('imageQuality', value)}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Data Saver)</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="original">Original</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
    
    <div className="flex justify-end">
      <Button onClick={() => handleSave("messages", { messages: userSettings.messages })}>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  </div>
)}

{/* Language & Region Section */}
{activeSection === "language" && (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Language</h3>
      <div className="space-y-2">
        <Label htmlFor="language">Display Language</Label>
        <p className="text-sm text-muted-foreground">Select your preferred language</p>
        <Select 
          value={userSettings.language}
          onValueChange={(value) => setUserSettings({...userSettings, language: value})}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="german">German</SelectItem>
            <SelectItem value="japanese">Japanese</SelectItem>
            <SelectItem value="chinese">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Region</h3>
      <div className="space-y-2">
        <Label htmlFor="region">Region Format</Label>
        <p className="text-sm text-muted-foreground">Select your region for date, time, and number formats</p>
        <Select 
          value={userSettings.region}
          onValueChange={(value) => setUserSettings({...userSettings, region: value})}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="united-states">United States</SelectItem>
            <SelectItem value="united-kingdom">United Kingdom</SelectItem>
            <SelectItem value="canada">Canada</SelectItem>
            <SelectItem value="australia">Australia</SelectItem>
            <SelectItem value="india">India</SelectItem>
            <SelectItem value="japan">Japan</SelectItem>
            <SelectItem value="germany">Germany</SelectItem>
            <SelectItem value="france">France</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <div className="flex justify-end">
      <Button onClick={() => handleSave("language", { 
        language: userSettings.language,
        region: userSettings.region 
      })}>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  </div>
)}
{/* Accessibility Section */}
{activeSection === "accessibility" && (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Accessibility Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="highContrast">High Contrast</Label>
            <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
          </div>
          <Switch 
            id="highContrast" 
            checked={userSettings.accessibility.highContrast}
            onCheckedChange={(checked) => updateAccessibilitySetting('highContrast', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="reducedMotion">Reduced Motion</Label>
            <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
          </div>
          <Switch 
            id="reducedMotion" 
            checked={userSettings.accessibility.reducedMotion}
            onCheckedChange={(checked) => updateAccessibilitySetting('reducedMotion', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="largeText">Large Text</Label>
            <p className="text-sm text-muted-foreground">Increase text size throughout the application</p>
          </div>
          <Switch 
            id="largeText" 
            checked={userSettings.accessibility.largeText}
            onCheckedChange={(checked) => updateAccessibilitySetting('largeText', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="screenReader">Screen Reader Support</Label>
            <p className="text-sm text-muted-foreground">Optimize interface for screen readers</p>
          </div>
          <Switch 
            id="screenReader" 
            checked={userSettings.accessibility.screenReader}
            onCheckedChange={(checked) => updateAccessibilitySetting('screenReader', checked)}
          />
        </div>
      </div>
    </div>
    <div className="flex justify-end">
      <Button onClick={() => handleSave("accessibility", { accessibility: userSettings.accessibility })}>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  </div>
)}

{/* Connected Accounts Section */}
{activeSection === "connected" && (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Connected Accounts</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Facebook</p>
              <p className="text-sm text-muted-foreground">Not Connected</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Connect</Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Twitter</p>
              <p className="text-sm text-muted-foreground">Not Connected</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Connect</Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </div>
            <div>
              <p className="font-medium">LinkedIn</p>
              <p className="text-sm text-muted-foreground">Connected as John Doe</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Disconnect</Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20.5c-7.5 0-10-8.5-10-10 0-2.5 2-5 5-5 2 0 3 1 5 1s3-1 5-1 5 2.5 5 5c0 1.5-2.5 10-10 10z" />
                <path d="M8.5 7.5v-3" />
                <path d="M15.5 7.5v-3" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Google</p>
              <p className="text-sm text-muted-foreground">Connected as john.doe@gmail.com</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Disconnect</Button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Privacy & Visibility Section */}
{activeSection === "privacy" && (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Privacy Settings</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profileVisibility">Profile Visibility</Label>
          <p className="text-sm text-muted-foreground">Control who can see your profile</p>
          <Select 
            value={userSettings.privacy.profileVisibility}
            onValueChange={(value) => updatePrivacySetting('profileVisibility', value)}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="contacts">Contacts Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="activityStatus">Activity Status</Label>
            <p className="text-sm text-muted-foreground">Show when you&apos;re active</p>
          </div>
          <Switch 
            id="activityStatus" 
            checked={userSettings.privacy.activityStatus}
            onCheckedChange={(checked) => updatePrivacySetting('activityStatus', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="readReceipts">Read Receipts</Label>
            <p className="text-sm text-muted-foreground">Let others know when you&apos;ve read their messages</p>
          </div>
          <Switch 
            id="readReceipts" 
            checked={userSettings.privacy.readReceipts}
            onCheckedChange={(checked) => updatePrivacySetting('readReceipts', checked)}
          />
        </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Data Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dataCollection">Data Collection</Label>
            <p className="text-sm text-muted-foreground">Allow usage data collection to improve our services</p>
          </div>
          <Switch 
            id="dataCollection" 
            checked={userSettings.privacy.dataCollection}
            onCheckedChange={(checked) => updatePrivacySetting('dataCollection', checked)}
          />
        </div>
        
        <div>
          <Button variant="outline" className="w-full max-w-xs" size="sm">
            Download Your Data
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Request a copy of all data associated with your account
          </p>
        </div>
        
        <div>
          <Button variant="outline" className="w-full max-w-xs border-destructive text-destructive hover:bg-destructive/10" size="sm">
            Delete Account
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Permanently delete your account and all associated data
          </p>
        </div>
      </div>
    </div>
    
    <div className="flex justify-end">
      <Button onClick={() => handleSave("privacy", { privacy: userSettings.privacy })}>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  </div>
)}

{/* Advanced Section */}
{activeSection === "advanced" && (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Advanced Options</h3>
      <div className="space-y-4">
        <div>
          <Button variant="outline" className="w-full max-w-xs" size="sm">
            Clear Cache
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Clear locally stored data to free up space
          </p>
        </div>
        
        <div>
          <Button variant="outline" className="w-full max-w-xs" size="sm">
            Export Settings
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Export your settings to use on another device
          </p>
        </div>
        
        <div>
          <Button variant="outline" className="w-full max-w-xs" size="sm">
            Import Settings
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Import settings from a backup
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="logLevel">Log Level</Label>
          <p className="text-sm text-muted-foreground">Set the level of logging detail</p>
          <Select defaultValue="error">
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select log level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="betaFeatures">Beta Features</Label>
            <p className="text-sm text-muted-foreground">Enable experimental features</p>
          </div>
          <Switch id="betaFeatures" checked={false} />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="analyticsConsent">Analytics</Label>
            <p className="text-sm text-muted-foreground">Share anonymous usage data to help us improve</p>
          </div>
          <Switch id="analyticsConsent" checked={true} />
        </div>
      </div>
    </div>
    
    <div className="flex justify-end">
      <Button>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  </div>
)}

              {/* Other sections would go here */}
              {/* For brevity, I'm omitting the other sections */}
              {/* You can add them back as needed */}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
