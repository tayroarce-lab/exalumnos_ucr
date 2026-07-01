'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function sendMessage(matchId: string, content: string) {
  const supabase = await createClient()
  
  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) throw new Error('No autorizado')
  const userId = userData.user.id

  const adminClient = createAdminClient()

  // Validar match
  const { data: match } = await adminClient
    .from('matches')
    .select('estado, estudiante_id, exalumno_id')
    .eq('id', matchId)
    .single()
    
  if (!match || match.estado !== 'activo' || (match.estudiante_id !== userId && match.exalumno_id !== userId)) {
    throw new Error('Match no válido o inactivo')
  }

  // Validar bloqueo
  const otherUserId = match.estudiante_id === userId ? match.exalumno_id : match.estudiante_id
  const { data: block } = await adminClient
    .from('user_blocks')
    .select('id')
    .eq('blocked_id', userId)
    .eq('blocker_id', otherUserId)
    .maybeSingle()
    
  if (block) throw new Error('Estás bloqueado por este usuario')

  // Obtener la configuración del usuario para el tiempo de expiración
  const { data: settings } = await adminClient
    .from('chat_settings')
    .select('message_expiration')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .maybeSingle()

  const expiration = settings?.message_expiration || 'nunca'
  
  let expires_at = null
  if (expiration !== 'nunca') {
    const now = new Date()
    if (expiration === '24_horas') now.setHours(now.getHours() + 24)
    if (expiration === '1_semana') now.setDate(now.getDate() + 7)
    if (expiration === '30_dias') now.setDate(now.getDate() + 30)
    expires_at = now.toISOString()
  }

  const { data, error } = await adminClient
    .from('chat_messages')
    .insert({
      match_id: matchId,
      sender_id: userId,
      content,
      expires_at
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  return data
}

export async function editMessage(messageId: string, content: string) {
  const supabase = await createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('No autorizado')

  const adminClient = createAdminClient()

  // Validar el tiempo transcurrido (5 minutos)
  const { data: msg } = await adminClient
    .from('chat_messages')
    .select('created_at, sender_id')
    .eq('id', messageId)
    .maybeSingle()

  if (!msg || msg.sender_id !== userData.user.id) throw new Error('Mensaje no encontrado o no autorizado')

  const createdAt = new Date(msg.created_at).getTime()
  const now = new Date().getTime()
  const diffMinutes = (now - createdAt) / (1000 * 60)

  if (diffMinutes > 5) throw new Error('Han pasado más de 5 minutos. No puedes editar este mensaje.')

  const { error } = await adminClient
    .from('chat_messages')
    .update({ 
      content, 
      is_edited: true, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', messageId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  return true
}

export async function deleteMessages(messageIds: string[]) {
  const supabase = await createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('No autorizado')

  const adminClient = createAdminClient()

  // Validar y borrar mensajes
  // Lo hacemos en lote
  const { data: msgs, error: fetchError } = await adminClient
    .from('chat_messages')
    .select('id, created_at, sender_id')
    .in('id', messageIds)

  if (fetchError || !msgs) throw new Error('Error buscando mensajes')

  const now = new Date().getTime()
  const validIdsToDel: string[] = []

  for (const msg of msgs) {
    if (msg.sender_id !== userData.user.id) continue
    const createdAt = new Date(msg.created_at).getTime()
    const diffMinutes = (now - createdAt) / (1000 * 60)
    
    if (diffMinutes <= 5) {
      validIdsToDel.push(msg.id)
    }
  }

  if (validIdsToDel.length > 0) {
    const { error } = await adminClient
      .from('chat_messages')
      .update({ is_deleted: true, content: 'Este mensaje fue eliminado.', updated_at: new Date().toISOString() })
      .in('id', validIdsToDel)

    if (error) throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  return validIdsToDel.length
}

export async function updateChatSettings(matchId: string, updates: { background_url?: string, message_expiration?: string }) {
  const supabase = await createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('No autorizado')
  const userId = userData.user.id

  const adminClient = createAdminClient()

  // Upsert settings
  const { data: existing } = await adminClient
    .from('chat_settings')
    .select('id')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    const { error } = await adminClient
      .from('chat_settings')
      .update(updates)
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await adminClient
      .from('chat_settings')
      .insert({
        match_id: matchId,
        user_id: userId,
        ...updates
      })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  return true
}

export async function blockUser(blockedId: string, matchId?: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('No autorizado')

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('user_blocks')
    .insert({
      blocker_id: userData.user.id,
      blocked_id: blockedId
    })

  if (error && error.code !== '23505') throw new Error(error.message)

  if (matchId) {
    await adminClient.from('matches').update({ estado: 'cerrado', notas_admin: 'Cerrado por bloqueo de usuario' }).eq('id', matchId)
  }

  return true
}
