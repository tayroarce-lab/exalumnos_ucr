'use client';

import { useState, useEffect } from 'react';
import { MatchAdminView } from '@/types/matches';
import '../../../../../styles/admin-matches.css';

interface MatchActionDialogProps {
  match: MatchAdminView | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    estado: MatchAdminView['estado'],
    resultado: MatchAdminView['resultado'],
    notas: string | null
  ) => Promise<void>;
}

export function MatchActionDialog({ match, isOpen, onClose, onSave }: MatchActionDialogProps) {
  const [estado, setEstado] = useState<MatchAdminView['estado']>('sugerido');
  const [resultado, setResultado] = useState<MatchAdminView['resultado']>(null);
  const [notas, setNotas] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar los valores del formulario cuando se abre el modal con un match diferente
  useEffect(() => {
    if (match) {
      setEstado(match.estado);
      setResultado(match.resultado);
      setNotas(match.notas_admin || '');
    }
  }, [match]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!match) return;
    setIsSaving(true);
    await onSave(match.id, estado, resultado, notas || null);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="admin-dialog-overlay" onClick={onClose}>
      {/* Evitar que el clic dentro del modal propague al overlay */}
      <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Gestionar Match</h3>

        {/* Información básica del match */}
        {match && (
          <div style={{ background: 'var(--admin-bg-hover)', borderRadius: '10px', padding: '16px', marginBottom: '24px', border: '1px solid var(--admin-border-color)' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: 'var(--admin-text-primary)' }}>
              <strong style={{ color: 'var(--admin-accent-celeste)' }}>Estudiante:</strong> {match.estudiante_nombre}
            </p>
            <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: 'var(--admin-text-primary)' }}>
              <strong style={{ color: 'var(--admin-accent-celeste)' }}>Exalumno:</strong> {match.exalumno_nombre}
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: 'var(--admin-text-primary)' }}>
              <strong style={{ color: 'var(--admin-accent-celeste)' }}>Carrera:</strong> {match.estudiante_carrera} &nbsp;|&nbsp;
              <strong style={{ color: 'var(--admin-accent-celeste)' }}>Score:</strong> {match.score_match}%
            </p>
          </div>
        )}

        {/* Selector de estado del match */}
        <div className="admin-dialog-field">
          <label className="admin-dialog-label">Estado del Match</label>
          <select
            className="admin-dialog-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value as MatchAdminView['estado'])}
          >
            <option value="sugerido">Sugerido</option>
            <option value="contactado">Contactado</option>
            <option value="activo">Activo</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>

        {/* Campo resultado: solo visible cuando el estado es cerrado */}
        {estado === 'cerrado' && (
          <div className="admin-dialog-field">
            <label className="admin-dialog-label">Resultado del Cierre</label>
            <select
              className="admin-dialog-select"
              value={resultado || ''}
              onChange={(e) => setResultado(e.target.value as MatchAdminView['resultado'])}
            >
              <option value="">-- Seleccionar --</option>
              <option value="exitoso">Exitoso</option>
              <option value="cancelado">Cancelado</option>
              <option value="en_progreso">En Progreso</option>
            </select>
          </div>
        )}

        {/* Notas internas del administrador */}
        <div className="admin-dialog-field">
          <label className="admin-dialog-label">Notas Internas (Admin)</label>
          <textarea
            className="admin-dialog-textarea"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Añadir notas sobre el seguimiento o motivo del cambio..."
          />
        </div>

        <div className="admin-dialog-actions">
          <button className="admin-dialog-btn-cancel" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button className="admin-dialog-btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
