import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Redirigir por defecto al primer elemento del menú (Reportes)
  redirect('/admin/reportes');
}
