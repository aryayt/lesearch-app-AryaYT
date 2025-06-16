import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export const formatApiKey = (key: string | undefined) => {
  if (!key) return "";
  const visibleLength = Math.min(4, key.length);
  const maskedLength = Math.max(0, key.length - visibleLength);
  return key.slice(0, visibleLength) + "•".repeat(maskedLength);
};

