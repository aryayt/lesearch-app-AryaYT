"use client";

import { Search, FileText, Import, Mic, Sparkles, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";

const HomePage = () => {
  const { firstname } = useUserStore();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full pt-4 pb-6">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Welcome Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold mb-1">
            ASK AI, <span className="text-primary">{firstname || "User"}</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Import documents and videos, start writing, or create a new recording
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {/* Write Card */}
          <div className="border rounded-lg p-3 flex flex-col items-center hover:bg-accent/50 transition-all duration-300 cursor-pointer group animate-fade-in-up delay-100" >
            <div className="bg-primary/10 p-2 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
              <FileText size={18} className="text-primary" />
            </div>
            <h2 className="font-medium text-sm">Write</h2>
            <p className="text-xs text-muted-foreground text-center">
              Write and Cite with AI
            </p>
          </div>

          {/* Import Card */}
          <div className="border rounded-lg p-3 flex flex-col items-center hover:bg-accent/50 transition-all duration-300 cursor-pointer group animate-fade-in-up delay-200" >
            <div className="bg-primary/10 p-2 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
              <Import size={18} className="text-primary" />
            </div>
            <h2 className="font-medium text-sm">Import</h2>
            <p className="text-xs text-muted-foreground text-center">
              Write and Chat with docs 
            </p>
          </div>

          {/* Record Card */}
          <div className="border rounded-lg p-3 flex flex-col items-center hover:bg-accent/50 transition-all duration-300 cursor-pointer group relative animate-fade-in-up delay-300" >
            <div className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              NEW
            </div>
            <div className="bg-primary/10 p-2 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
              <Mic size={18} className="text-primary" />
            </div>
            <h2 className="font-medium text-sm">Explore Papers</h2>
            <p className="text-xs text-muted-foreground text-center">
              Discover and explore research papers 
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 animate-fade-in-up">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search your library..." 
              className="pl-9 bg-background border-muted h-9 text-sm focus:ring-1 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <span className="sr-only">Clear search</span>
                <X size={14} />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Actions Section */}
          <div className="md:col-span-1 animate-fade-in-up" >
            <h3 className="text-xs font-medium mb-2 text-muted-foreground flex items-center">
              <span className="uppercase tracking-wider">Actions</span>
              <div className="ml-2 flex-grow h-px bg-border"/>
            </h3>
            <div className="space-y-1.5">
              <div className="border rounded-md p-2 flex items-center gap-2 hover:bg-accent/50 transition-colors cursor-pointer group">
                <div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Sparkles size={14} className="text-primary" />
                </div>
                <span className="text-sm">Ask AI...</span>
              </div>
              <div className="border rounded-md p-2 flex items-center gap-2 hover:bg-accent/50 transition-colors cursor-pointer group">
                <div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Plus size={14} className="text-primary" />
                </div>
                <span className="text-sm">Create new document</span>
              </div>
            </div>
          </div>

          {/* Library Section */}
          <div className="md:col-span-2 animate-fade-in-up" >
            <h3 className="text-xs font-medium mb-2 text-muted-foreground flex items-center">
              <span className="uppercase tracking-wider">Library</span>
              <div className="ml-2 flex-grow h-px bg-border"/>
            </h3>
            <div className="border rounded-lg overflow-hidden">
              {[
                "link 3 - kernal",
                "AIS paper #2",
                "link 2",
                "AI OS link1",
                "AI OS Link 3",
                "Untitled",
                "New Recording"
              ].map((item, index) => (
                <div 
                  key={item} 
                  className={`flex items-center gap-2 p-2 hover:bg-accent/50 transition-colors cursor-pointer text-sm ${
                    index !== 6 ? "border-b" : ""
                  }`}
                >
                  <FileText size={14} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{item}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Today</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
