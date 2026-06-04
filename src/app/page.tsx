import { redirect } from 'next/navigation';

export default function RootPage() {
  // Como estamos trabajando solo en la parte administrativa en esta etapa,
  // redirigimos automáticamente a la gestión de matches para evitar el 404.
  redirect('/admin/matches');
}
