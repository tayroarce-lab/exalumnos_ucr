'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type NotificacionInsert = {
  user_id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  link?: string | null;
};

export async function createNotification(data: NotificacionInsert) {
  const supabase = await createClient()
  const { error } = await supabase.from('notificaciones').insert([data])
  if (error) {
    console.error('Error creating notification:', error)
  }
}

export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'No user' }

  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return { data, error }
}

export async function getUnreadNotificationsCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { count: 0 }

  const { count, error } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('leida', false)

  return { count: count || 0, error }
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', id)

  if (!error) {
    revalidatePath('/', 'layout')
  }
  return { error }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No user' }

  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('user_id', user.id)
    .eq('leida', false)

  if (!error) {
    revalidatePath('/', 'layout')
  }
  return { error }
}

export async function deleteNotification(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notificaciones')
    .delete()
    .eq('id', id)

  if (!error) {
    revalidatePath('/', 'layout')
  }
  return { error }
}
