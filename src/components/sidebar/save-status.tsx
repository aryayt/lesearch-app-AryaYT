import type { LucideIcon } from "lucide-react";

import { XCircleIcon } from "lucide-react";

import { CheckCircle2Icon } from "lucide-react";

import { LoaderIcon } from "lucide-react";
import type{ Status } from "@/store/useDocStore";
interface StatusConfig {
    Icon: LucideIcon;
    text: string;
    className: string;
    animation?: string;
  }
  
  interface SaveStatusProps {
    status: Status;
  }
  
  
  
  const statusConfig: Record<NonNullable<Status>, StatusConfig> = {
    start: {
      Icon: LoaderIcon,
      text: "Saving",
      className: "text-muted-foreground",
      animation: "animate-spin",
    },
    success: {
      Icon: CheckCircle2Icon,
      text: "Save success",
      className: "text-green-600",
    },
    failed: {
      Icon: XCircleIcon,
      text: "Save failed",
      className: "text-destructive",
    },
  };
  
  export const SaveStatus: React.FC<SaveStatusProps> = ({ status }) => {
    if (!status) return null;
  
    const config = statusConfig[status];
    if (!config) return null;
  
    const { Icon, text, className, animation } = config;
  
    return (
      <p className={`flex items-center gap-x-1 text-xs ${className}`}>
        <Icon className={`inline-block ${animation || ""}`} size={14} />
        <span className="hidden md:inline">{text}</span>
      </p>
    );
  };