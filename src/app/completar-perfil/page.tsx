import { redirect } from 'next/navigation';

export default function CompletarPerfilRedirect() {
  redirect('/profile/edit');
}
