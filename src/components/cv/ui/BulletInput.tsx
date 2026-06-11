'use client';

import React, { useState } from 'react';
import { Sparkles, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BulletInputProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function BulletInput({ value, onChange, onRemove, placeholder, disabled }: BulletInputProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const maxLength = 120;
  const currentLength = value.length;
  const isOverLimit = currentLength > maxLength;

  const handleRewrite = async () => {
    if (!value.trim()) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/cv/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet: value })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error reescribiendo viñeta');
      }

      onChange(data.rewritten);
      
      if (data.rewritten.length > maxLength) {
        toast({
          title: 'Texto generado excede límite',
          description: 'Por favor acorta el texto generado manualmente.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '✨ Viñeta mejorada',
          description: 'El texto ha sido optimizado para ATS.',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error de IA',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full relative group">
      <div className="flex items-start gap-2">
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isGenerating}
            placeholder={placeholder || "Ej: Lideré un equipo de 5 personas incrementando las ventas un 20%..."}
            className={`w-full text-sm rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-md text-slate-900 dark:text-white px-4 py-3 shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 ${
              isOverLimit 
                ? 'border-red-500 focus-visible:ring-red-500' 
                : 'border-slate-200/60 dark:border-white/10 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500'
            } min-h-[60px] resize-none`}
            rows={2}
          />
          <div className={`absolute bottom-2 right-2 text-xs font-medium ${isOverLimit ? 'text-red-500' : 'text-slate-400'}`}>
            {currentLength} / {maxLength}
          </div>
        </div>
        
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={handleRewrite}
            disabled={disabled || isGenerating || !value.trim()}
            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-md transition-colors disabled:opacity-50"
            title="Mejorar con IA"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled || isGenerating}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
            title="Eliminar viñeta"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
