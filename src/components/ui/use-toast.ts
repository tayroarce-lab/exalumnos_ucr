'use client';

// Mock hook to resolve 'use-toast' import errors since shadcn/ui installation failed.
export function useToast() {
  return {
    toast: (props: { title?: string; description?: string; variant?: string }) => {
      // Basic fallback using console. In a real app this would trigger a context state.
      console.log(`[Toast] ${props.title}: ${props.description || ''}`);
      if (props.variant === 'destructive') {
        console.error(`[Error] ${props.title}: ${props.description || ''}`);
      }
    }
  };
}
