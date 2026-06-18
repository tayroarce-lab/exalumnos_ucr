import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Redirigir por defecto al Dashboard de Impacto
  redirect('/admin/dashboard');
}

