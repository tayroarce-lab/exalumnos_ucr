'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export type SkillLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;

export interface TagItem {
  id: string; // Puede ser un temp-id si es nuevo
  name: string;
  level: SkillLevel;
}

interface TagInputProps {
  items: TagItem[];
  onAdd: (name: string, level: SkillLevel) => void;
  onRemove: (id: string) => void;
  type: 'technical' | 'soft' | 'language';
  disabled?: boolean;
}

export function TagInput({ items, onAdd, onRemove, type, disabled }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>(
    type === 'technical' ? 'Intermedio' : type === 'language' ? 'B2' : null
  );

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    onAdd(inputValue.trim(), type === 'soft' ? null : selectedLevel);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const levelsTechnical = ['Básico', 'Intermedio', 'Avanzado'];
  const levelsLanguage = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={type === 'soft' ? "Añadir habilidad (ej: Liderazgo)" : "Añadir..."}
          className="flex-1 rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:opacity-50"
        />
        
        {type === 'technical' && (
          <select 
            value={selectedLevel || ''} 
            onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
            disabled={disabled}
            className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:opacity-50"
          >
            {levelsTechnical.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
        
        {type === 'language' && (
          <select 
            value={selectedLevel || ''} 
            onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
            disabled={disabled}
            className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:opacity-50"
          >
            {levelsLanguage.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 h-9 px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-1" /> Añadir
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 bg-slate-100 text-slate-900 hover:bg-slate-100/80"
          >
            {item.name} {item.level && <span className="text-slate-500 font-normal ml-1">({item.level})</span>}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={disabled}
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
            >
              <X className="h-3 w-3 text-slate-500 hover:text-slate-900" />
              <span className="sr-only">Remove</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
