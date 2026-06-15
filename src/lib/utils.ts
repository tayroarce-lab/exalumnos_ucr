import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(foto_url: string | null | undefined): string | null {
  if (!foto_url) return null;
  if (foto_url.startsWith('http') || foto_url.startsWith('data:')) return foto_url;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/avatars/${foto_url}`;
}
