"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"

interface UserSettings {
  theme?: string;
  showAvatars?: boolean;
  compactMode?: boolean;
  fontSize?: string;
}

interface AppearanceSectionProps {
  userSettings: {
    theme?: string;
    showAvatars?: boolean;
    compactMode?: boolean;
    fontSize?: string;
  };
  onSave: (data: UserSettings) => void;
  onSettingsChange: (data: UserSettings) => void;
}

export function AppearanceSection({ userSettings, onSave, onSettingsChange }: AppearanceSectionProps) {
  const { setTheme } = useTheme()

  const updateTheme = (newTheme: string): void => {
    setTheme(newTheme)
    onSettingsChange({...userSettings, theme: newTheme})
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Theme</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card 
            className={`cursor-pointer ${userSettings.theme === 'light' ? 'border-primary' : 'border-border'}`} 
            onClick={() => updateTheme('light')}
          >
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
          <Card 
            className={`cursor-pointer ${userSettings.theme === 'dark' ? 'border-primary' : 'border-border'}`} 
            onClick={() => updateTheme('dark')}
          >
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
          <Card 
            className={`cursor-pointer ${userSettings.theme === 'system' ? 'border-primary' : 'border-border'}`} 
            onClick={() => updateTheme('system')}
          >
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
            <Switch 
              id="showAvatars" 
              checked={userSettings.showAvatars} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, showAvatars: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compactMode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing between elements</p>
            </div>
            <Switch 
              id="compactMode" 
              checked={userSettings.compactMode} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, compactMode: checked})}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Font Size</h3>
        <div className="w-full max-w-xs">
          <Select 
            value={userSettings.fontSize} 
            onValueChange={(value) => onSettingsChange({...userSettings, fontSize: value})}
          >
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
        <Button onClick={() => onSave({
          theme: userSettings.theme,
          showAvatars: userSettings.showAvatars,
          compactMode: userSettings.compactMode,
          fontSize: userSettings.fontSize
        })}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
} 