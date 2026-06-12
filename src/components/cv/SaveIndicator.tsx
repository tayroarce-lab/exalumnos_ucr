'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  state: SaveState;
  message?: string;
}

export function SaveIndicator({ state, message }: SaveIndicatorProps) {
  if (state === 'idle') return null;

  return (
    <div className="flex items-center space-x-2 text-sm font-medium transition-all">
      {state === 'saving' && (
        <span className="flex items-center text-blue-600 dark:text-blue-400">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Guardando...
        </span>
      )}
      {state === 'saved' && (
        <span className="flex items-center text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Cambios guardados
        </span>
      )}
      {state === 'error' && (
        <span className="flex items-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mr-2" />
          {message || 'Error al guardar'}
        </span>
      )}
    </div>
  );
}
