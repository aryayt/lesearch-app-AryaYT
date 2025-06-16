"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

interface PrivacySettings {
  profileVisibility?: string;
  showOnlineStatus?: boolean;
  allowDirectMessages?: boolean;
  dataCollection?: boolean;
  analyticsEnabled?: boolean;
  searchableProfile?: boolean;
}

interface PrivacySectionProps {
  userSettings: PrivacySettings;
  onSave: (data: PrivacySettings) => void;
  onSettingsChange: (data: PrivacySettings) => void;
}

export function PrivacySection({ userSettings, onSave, onSettingsChange }: PrivacySectionProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your privacy is important to us. These settings control how your information is shared and used.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Visibility</h3>
        <div className="w-full max-w-xs">
          <Select 
            value={userSettings.profileVisibility} 
            onValueChange={(value) => onSettingsChange({...userSettings, profileVisibility: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="connections">Connections Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Privacy Controls</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showOnlineStatus">Online Status</Label>
              <p className="text-sm text-muted-foreground">Show when you&apos;re active on the platform</p>
            </div>
            <Switch 
              id="showOnlineStatus" 
              checked={userSettings.showOnlineStatus} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, showOnlineStatus: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowDirectMessages">Direct Messages</Label>
              <p className="text-sm text-muted-foreground">Allow others to send you direct messages</p>
            </div>
            <Switch 
              id="allowDirectMessages" 
              checked={userSettings.allowDirectMessages} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, allowDirectMessages: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="searchableProfile">Searchable Profile</Label>
              <p className="text-sm text-muted-foreground">Allow others to find your profile in search</p>
            </div>
            <Switch 
              id="searchableProfile" 
              checked={userSettings.searchableProfile} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, searchableProfile: checked})}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Data & Analytics</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dataCollection">Data Collection</Label>
              <p className="text-sm text-muted-foreground">Allow us to collect usage data to improve our services</p>
            </div>
            <Switch 
              id="dataCollection" 
              checked={userSettings.dataCollection} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, dataCollection: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analyticsEnabled">Analytics</Label>
              <p className="text-sm text-muted-foreground">Enable analytics to improve your experience</p>
            </div>
            <Switch 
              id="analyticsEnabled" 
              checked={userSettings.analyticsEnabled} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, analyticsEnabled: checked})}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave({
          profileVisibility: userSettings.profileVisibility,
          showOnlineStatus: userSettings.showOnlineStatus,
          allowDirectMessages: userSettings.allowDirectMessages,
          dataCollection: userSettings.dataCollection,
          analyticsEnabled: userSettings.analyticsEnabled,
          searchableProfile: userSettings.searchableProfile
        })}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
} 