import { Metadata } from 'next';
import { MatchesTable } from './_components/matches-table';

export const metadata: Metadata = {
  title: 'Gestión de Matches | Admin | Fundación Exalumnos UCR',
  description: 'Panel administrativo para la gestión de matches entre exalumnos y estudiantes.',
};

export default function AdminMatchesPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Panel Administrativo - Matches</h1>
        <p style={{ color: '#666' }}>Gestiona, filtra y exporta las relaciones de apoyo entre estudiantes y exalumnos.</p>
      </header>

      <main>
        <MatchesTable />
      </main>
    </div>
  );
}
