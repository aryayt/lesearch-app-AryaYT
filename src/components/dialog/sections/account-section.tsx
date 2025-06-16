"use client"

import * as React from "react"
import { Save, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SectionProps {
  userSettings: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    bio?: string;
    profileImage?: string;
  };
  onSave: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    bio?: string;
  }) => void;
  onSettingsChange: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    bio?: string;
  }) => void;
}

export function AccountSection({ userSettings, onSave, onSettingsChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="h-24 w-24">
            <AvatarImage src={userSettings.profileImage} alt={`${userSettings.firstName} ${userSettings.lastName}`} />
            <AvatarFallback>{userSettings.firstName?.[0]}{userSettings.lastName?.[0]}</AvatarFallback>
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
                value={userSettings.firstName || ""} 
                onChange={(e) => onSettingsChange({...userSettings, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={userSettings.lastName || ""} 
                onChange={(e) => onSettingsChange({...userSettings, lastName: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={userSettings.email || ""} 
                onChange={(e) => onSettingsChange({...userSettings, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={userSettings.username || ""} 
                onChange={(e) => onSettingsChange({...userSettings, username: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              value={userSettings.bio || ""} 
              onChange={(e) => onSettingsChange({...userSettings, bio: e.target.value})}
              className="h-20"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSave({
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
  )
} 