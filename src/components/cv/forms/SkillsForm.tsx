'use client';

import React, { useState } from 'react';
import { TagInput, SkillLevel } from '../ui/TagInput';
import { upsertSkill, deleteSkill } from '@/app/actions/cv/skills.actions';
import { SkillData } from '@/app/actions/cv/schemas';
import { SaveState } from '../SaveIndicator';

interface Props {
  initialData?: SkillData[];
  onSaveStateChange: (state: SaveState, message?: string) => void;
}

export function SkillsForm({ initialData = [], onSaveStateChange }: Props) {
  const [skills, setSkills] = useState<SkillData[]>(initialData);

  const handleAdd = async (name: string, level: SkillLevel, type: 'technical' | 'soft' | 'language') => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newSkill: SkillData = { id: tempId, name, level: level as any, skill_type: type };
    setSkills(prev => [...prev, newSkill]);
    
    onSaveStateChange('saving');
    
    // Save to DB
    const res = await upsertSkill({ name, level: level as any, skill_type: type });
    if (res.success) {
      onSaveStateChange('saved');
      // En una app real, recargaríamos los datos para obtener el UUID real de la DB
      // Aquí por simplicidad, si borramos el tag sin recargar la página, podría fallar si usa tempId.
      // Pero como revalidatePath se llama en el server action, al cambiar de página se refrescará.
    } else {
      onSaveStateChange('error', res.message);
      // Revertir
      setSkills(prev => prev.filter(s => s.id !== tempId));
    }
  };

  const handleRemove = async (id: string) => {
    if (id.startsWith('temp-')) {
      setSkills(prev => prev.filter(s => s.id !== id));
      return;
    }

    onSaveStateChange('saving');
    const res = await deleteSkill(id);
    if (res.success) {
      setSkills(prev => prev.filter(s => s.id !== id));
      onSaveStateChange('saved');
    } else {
      onSaveStateChange('error', res.message);
    }
  };

  const techSkills = skills.filter(s => s.skill_type === 'technical').map(s => ({ id: s.id as string, name: s.name, level: s.level as SkillLevel }));
  const softSkills = skills.filter(s => s.skill_type === 'soft').map(s => ({ id: s.id as string, name: s.name, level: s.level as SkillLevel }));
  const langSkills = skills.filter(s => s.skill_type === 'language').map(s => ({ id: s.id as string, name: s.name, level: s.level as SkillLevel }));

  return (
    <div className="space-y-8">
      
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Habilidades Técnicas</h3>
          <p className="text-sm text-slate-500">Lenguajes de programación, frameworks, herramientas de software, etc.</p>
        </div>
        <TagInput 
          type="technical"
          items={techSkills}
          onAdd={(name, level) => handleAdd(name, level, 'technical')}
          onRemove={handleRemove}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <div>
          <h3 className="text-lg font-medium">Habilidades Blandas</h3>
          <p className="text-sm text-slate-500">Liderazgo, trabajo en equipo, resolución de problemas...</p>
        </div>
        <TagInput 
          type="soft"
          items={softSkills}
          onAdd={(name, level) => handleAdd(name, level, 'soft')}
          onRemove={handleRemove}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <div>
          <h3 className="text-lg font-medium">Idiomas</h3>
          <p className="text-sm text-slate-500">Selecciona el nivel según el Marco Común Europeo de Referencia.</p>
        </div>
        <TagInput 
          type="language"
          items={langSkills}
          onAdd={(name, level) => handleAdd(name, level, 'language')}
          onRemove={handleRemove}
        />
      </section>

    </div>
  );
}
