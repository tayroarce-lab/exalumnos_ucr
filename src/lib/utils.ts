import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(foto_url: string | null | undefined, nombreAlternativo?: string): string | null {
  if (!foto_url) return null;
  
  // FIX: Intercept broken mock domains to prevent console errors
  if (foto_url.includes('storage.fundacionucr.ac.cr')) {
    const filename = foto_url.split('/').pop() || '';
    const seed = filename.replace('.jpg', '').replace('.png', '').replace(/_/g, '+');
    const finalName = seed || nombreAlternativo || 'U';
    return `https://ui-avatars.com/api/?name=${finalName}&background=random&color=fff&size=150`;
  }

  if (foto_url.startsWith('http') || foto_url.startsWith('data:') || foto_url.startsWith('/')) return foto_url;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/avatars/${foto_url}`;
}
