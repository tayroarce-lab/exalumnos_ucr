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
    <div className="flex flex-col gap-3 font-sans">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={type === 'soft' ? "Añadir habilidad (ej: Liderazgo)" : "Añadir..."}
          className="flex-1 rounded-xl border border-slate-300 bg-blanco px-4 py-2 text-sm text-negro-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 disabled:opacity-50"
        />
        
        {type === 'technical' && (
          <select 
            value={selectedLevel || ''} 
            onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
            disabled={disabled}
            className="rounded-xl border border-slate-300 bg-blanco px-4 py-2 text-sm text-negro-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 disabled:opacity-50"
          >
            {levelsTechnical.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
        
        {type === 'language' && (
          <select 
            value={selectedLevel || ''} 
            onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
            disabled={disabled}
            className="rounded-xl border border-slate-300 bg-blanco px-4 py-2 text-sm text-negro-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/50 disabled:opacity-50"
          >
            {levelsLanguage.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim()}
          className="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste disabled:pointer-events-none disabled:opacity-50 bg-celeste text-blanco shadow hover:bg-celeste/90 h-[42px] px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-1" /> Añadir
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="inline-flex items-center gap-1 rounded-full border border-celeste/20 px-3 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-celeste focus:ring-offset-2 bg-celeste/10 text-celeste hover:bg-celeste/20"
          >
            {item.name} {item.level && <span className="text-celeste/70 font-bold ml-1">({item.level})</span>}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={disabled}
              className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-celeste focus:ring-offset-2 disabled:opacity-50"
            >
              <X className="h-4 w-4 text-celeste/70 hover:text-naranja transition-colors" />
              <span className="sr-only">Remove</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
