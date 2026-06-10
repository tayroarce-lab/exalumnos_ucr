import { redirect } from 'next/navigation';

export default function DirectorioIndexPage() {
  // Redirigir por defecto al directorio de estudiantes
  redirect('/directorio/estudiantes');
}
