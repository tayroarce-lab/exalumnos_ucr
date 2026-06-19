import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getMyMatches, upsertManualMatch } from '@/actions/matches';
import { MatchesList } from './_components/matches-list';

export const metadata: Metadata = {
  title: 'Mis Conexiones | Exalumnos UCR',
  description: 'Revisa y gestiona tus sugerencias de conexión (matches).',
};

export default async function MisMatchesPage({
  searchParams,
}: {
  searchParams: { nuevo?: string; tipo?: string; nombre?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Si viene del modal "Ofrecer Apoyo" con parámetros, crear el match automáticamente
  const { nuevo: estudianteId, tipo: tipoApoyo } = searchParams;
  if (estudianteId && tipoApoyo && ['mentoria', 'empleo', 'pasantia'].includes(tipoApoyo)) {
    await upsertManualMatch(estudianteId, tipoApoyo);
    // Redirigir limpiando los parámetros de la URL
    redirect('/mis-matches');
  }

  const { data: matches, error } = await getMyMatches();

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mis Conexiones</h1>
        <p className="text-gray-500">
          Aquí aparecen tus conexiones activas de mentoría, empleo y pasantías con estudiantes UCR.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          Hubo un error cargando tus conexiones: {error}
        </div>
      ) : (
        <MatchesList initialMatches={matches || []} currentUserId={user.id} currentUserRole={user.user_metadata?.rol || 'estudiante'} />
      )}
    </div>
  );
}
