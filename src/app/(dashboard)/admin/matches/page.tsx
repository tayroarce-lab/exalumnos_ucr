import { Metadata } from 'next';
import { Download } from 'lucide-react';
import { MatchesTable } from './_components/matches-table';
import '@/styles/admin-dashboard.css';
import '@/styles/admin-matches.css';

export const metadata: Metadata = {
  title: 'Gestión de Matches | Admin | Fundación Exalumnos UCR',
  description: 'Panel administrativo para la gestión de matches entre exalumnos y estudiantes.',
};

export default function AdminMatchesPage() {
  return (
    <div className="admin-page-container">
      {/* Encabezado con título y botón de exportación */}
      <div className="matches-header">
        <div className="matches-header-titles">
          <h1>Gestión de Matches</h1>
          <p>Gestiona, filtra y exporta las relaciones de apoyo entre estudiantes y exalumnos.</p>
        </div>
      </div>

      <main>
        <MatchesTable />
      </main>
    </div>
  );
}
