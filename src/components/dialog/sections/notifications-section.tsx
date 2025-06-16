"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NotificationSettings {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  soundEnabled?: boolean;
  notificationFrequency?: string;
  notifyOnMention?: boolean;
  notifyOnReply?: boolean;
  notifyOnNewMessage?: boolean;
}

interface NotificationsSectionProps {
  userSettings: NotificationSettings;
  onSave: (data: NotificationSettings) => void;
  onSettingsChange: (data: NotificationSettings) => void;
}

export function NotificationsSection({ userSettings, onSave, onSettingsChange }: NotificationsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch 
              id="emailNotifications" 
              checked={userSettings.emailNotifications} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, emailNotifications: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
            </div>
            <Switch 
              id="pushNotifications" 
              checked={userSettings.pushNotifications} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, pushNotifications: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="soundEnabled">Sound Alerts</Label>
              <p className="text-sm text-muted-foreground">Play sound for new notifications</p>
            </div>
            <Switch 
              id="soundEnabled" 
              checked={userSettings.soundEnabled} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, soundEnabled: checked})}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Frequency</h3>
        <div className="w-full max-w-xs">
          <Select 
            value={userSettings.notificationFrequency} 
            onValueChange={(value) => onSettingsChange({...userSettings, notificationFrequency: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="hourly">Hourly Digest</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Digest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Types</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyOnMention">Mentions</Label>
              <p className="text-sm text-muted-foreground">Notify when someone mentions you</p>
            </div>
            <Switch 
              id="notifyOnMention" 
              checked={userSettings.notifyOnMention} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, notifyOnMention: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyOnReply">Replies</Label>
              <p className="text-sm text-muted-foreground">Notify when someone replies to your messages</p>
            </div>
            <Switch 
              id="notifyOnReply" 
              checked={userSettings.notifyOnReply} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, notifyOnReply: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyOnNewMessage">New Messages</Label>
              <p className="text-sm text-muted-foreground">Notify when you receive new messages</p>
            </div>
            <Switch 
              id="notifyOnNewMessage" 
              checked={userSettings.notifyOnNewMessage} 
              onCheckedChange={(checked) => onSettingsChange({...userSettings, notifyOnNewMessage: checked})}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave({
          emailNotifications: userSettings.emailNotifications,
          pushNotifications: userSettings.pushNotifications,
          soundEnabled: userSettings.soundEnabled,
          notificationFrequency: userSettings.notificationFrequency,
          notifyOnMention: userSettings.notifyOnMention,
          notifyOnReply: userSettings.notifyOnReply,
          notifyOnNewMessage: userSettings.notifyOnNewMessage
        })}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
} 