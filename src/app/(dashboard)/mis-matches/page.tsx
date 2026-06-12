import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getMyMatches } from '@/actions/matches';
import { MatchesList } from './_components/matches-list';

export const metadata: Metadata = {
  title: 'Mis Sugerencias de Conexión | Exalumnos UCR',
  description: 'Revisa y gestiona tus sugerencias de conexión (matches).',
};

export default async function MisMatchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: matches, error } = await getMyMatches();

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tus Sugerencias de Conexión</h1>
        <p className="text-gray-500">
          Revisa las sugerencias del sistema basadas en tus intereses, carrera y áreas de apoyo.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          Hubo un error cargando tus sugerencias: {error}
        </div>
      ) : (
        <MatchesList initialMatches={matches || []} currentUserId={user.id} />
      )}
    </div>
  );
}
