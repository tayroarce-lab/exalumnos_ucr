'use client';

import { useState } from 'react';
import { MatchAdminView } from '@/types/matches';

interface MatchActionDialogProps {
  match: MatchAdminView | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, estado: MatchAdminView['estado'], resultado: MatchAdminView['resultado'], notas: string | null) => Promise<void>;
}

export function MatchActionDialog({ match, isOpen, onClose, onSave }: MatchActionDialogProps) {
  const [estado, setEstado] = useState<MatchAdminView['estado']>(match?.estado || 'sugerido');
  const [resultado, setResultado] = useState<MatchAdminView['resultado']>(match?.resultado || null);
  const [notas, setNotas] = useState<string>(match?.notas_admin || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar estado cuando el modal se abre con un nuevo match
  if (!isOpen) return null;

  const handleSave = async () => {
    if (!match) return;
    setIsSaving(true);
    await onSave(match.id, estado, resultado, notas);
    setIsSaving(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
        <h3>Gestionar Match</h3>
        {match && (
          <div style={{ marginBottom: '1rem' }}>
            <p><strong>Estudiante:</strong> {match.estudiante_nombre}</p>
            <p><strong>Exalumno:</strong> {match.exalumno_nombre}</p>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Estado del Match</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value as any)} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="sugerido">Sugerido</option>
            <option value="contactado">Contactado</option>
            <option value="activo">Activo</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>

        {estado === 'cerrado' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Resultado del cierre</label>
            <select value={resultado || ''} onChange={(e) => setResultado(e.target.value as any)} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="">-- Seleccionar --</option>
              <option value="exitoso">Exitoso</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notas Internas (Admin)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '0.5rem' }}
            placeholder="Añadir notas sobre el seguimiento..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} disabled={isSaving} style={{ padding: '0.5rem 1rem' }}>Cancelar</button>
          <button onClick={handleSave} disabled={isSaving} style={{ padding: '0.5rem 1rem' }}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
