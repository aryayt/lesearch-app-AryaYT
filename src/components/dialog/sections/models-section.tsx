"use client"

import * as React from "react"
import { ArrowRight, Loader2, ChevronDown, Pencil, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { googleModels, openaiModels } from "@/lib/ai/models"
import { useAPIKeyStore } from "@/store/apiKeyStore"
import { cn, formatApiKey } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

const PROVIDER_INFO = {
  google: {
    name: 'Google AI',
    description: 'Your Google AI API key for Gemini Pro and other models',
    models: googleModels
  },
  openai: {
    name: 'OpenAI',
    description: 'Your OpenAI API key for GPT-4 and other models',
    models: openaiModels
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Your Anthropic API key for Claude and other models',
    models: []
  },
  grok: {
    name: 'Grok AI',
    description: 'Your Grok AI API key for Grok-1 and other models',
    models: []
  }
} as const;

export function ModelsSection() {
  const { 
    apiKeys, 
    activeModels, 
    isLoading,
    error,
    verifyAPIKey,
    toggleModel,
    updateInputKey
  } = useAPIKeyStore();

  const [isExpanded, setIsExpanded] = React.useState<Record<string, boolean>>({});
  const [editingProvider, setEditingProvider] = React.useState<string | null>(null);

  const handleVerify = async (key: string, provider: string) => {
    if (!key) {
      toast.error("Please enter a valid API key");
      return;
    }
    await verifyAPIKey(provider, key);
    setEditingProvider(null);
  };

  const handleEdit = (provider: string) => {
    setEditingProvider(provider);
  };

  const handleCancel = () => {
    setEditingProvider(null);
  };

  const toggleExpand = (provider: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (isLoading.initialize) {
    return <div className="flex justify-center items-center h-full">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  }

  const renderApiKeyInput = (provider: keyof typeof PROVIDER_INFO) => {
    const isEditing = editingProvider === provider;
    const isVerified = apiKeys[provider]?.isVerified;
    const currentKey = apiKeys[provider]?.api_key || '';
    const info = PROVIDER_INFO[provider];

    return (
      <div className="space-y-2">
        <Label htmlFor={`${provider}ApiKey`}>{info.name} API Key</Label>
        <p className="text-sm text-muted-foreground">
          {info.description}
        </p>
        <div className="flex gap-2">
          <Input 
            id={`${provider}ApiKey`}
            type="text"
            placeholder={`Enter your ${info.name} API key`}
            value={isVerified && !isEditing 
              ? formatApiKey(currentKey)
              : currentKey}
            onChange={(e) => updateInputKey(provider, e.target.value)}
            className="flex-1 font-mono text-sm text-muted-foreground"
            disabled={isVerified && !isEditing}
          />
          <div className="flex gap-2">
            {isVerified && !isEditing ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(provider)}
                    className="h-9 w-9"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit API Key</TooltipContent>
              </Tooltip>
            ) : (
              <>
                {isEditing && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCancel}
                        className="h-9 w-9"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cancel</TooltipContent>
                  </Tooltip>
                )}
                <Button 
                  variant="outline" 
                  size="default"
                  onClick={() => handleVerify(currentKey, provider)}
                  disabled={isLoading[provider]}
                  className="h-9 px-4"
                >
                  {isLoading[provider] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isVerified ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
        {info.models.length > 0 && (
          <div className="mt-4 space-y-2">
            <button
              onClick={() => toggleExpand(provider)}
              className="flex items-center gap-2 w-full text-left"
            >
              <Label className="cursor-pointer">Available Models</Label>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isExpanded[provider] ? "transform rotate-180" : ""
              )} />
            </button>
            <div className={cn(
              "space-y-2 transition-all duration-200",
              isExpanded[provider] ? "block" : "hidden"
            )}>
              {info.models.map((model) => (
                <div key={model.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                  <Switch
                    checked={activeModels[provider]?.includes(model.id)}
                    onCheckedChange={() => toggleModel(model.id, provider)}
                    disabled={!isVerified}
                    className="cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">API Keys</h3>
        <div className="space-y-4">
          {renderApiKeyInput('google')}
          <Separator />
          {renderApiKeyInput('openai')}
          <Separator />
          {renderApiKeyInput('anthropic')}
          <Separator />
          {renderApiKeyInput('grok')}
        </div>
      </div>
    </div>
  )
}