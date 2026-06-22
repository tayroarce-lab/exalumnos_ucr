'use server';

import { createClient } from '@/lib/supabase/server';
import { ChatOctavioConversation, ChatOctavioMessage, ChatOctavioRequest, ChatOctavioUser } from '@/types/ChatOctavioTypes';

/**
 * Obtiene el usuario autenticado actual y su perfil simplificado.
 */
export async function chatoctavio_getCurrentUser(): Promise<{ data: ChatOctavioUser | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: 'No autenticado' };
  }

  // Consultamos los datos en public.users para obtener el rol y otros campos
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, nombre, email, rol, foto_url')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return { data: null, error: 'No se encontró el perfil de usuario' };
  }

  return {
    data: {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol as any,
      foto_url: userData.foto_url
    },
    error: null
  };
}

/**
 * Sincroniza los matches activos en public.matches creando conversaciones en chatoctavio_conversaciones.
 * Esto evita modificar la lógica de matches existente.
 */
async function syncActiveMatchesToConversations(userId: string) {
  const supabase = await createClient();

  // 1. Obtener matches en estado 'activo' donde participe el usuario
  const { data: activeMatches, error: matchesError } = await supabase
    .from('matches')
    .select('exalumno_id, estudiante_id')
    .eq('estado', 'activo')
    .or(`exalumno_id.eq.${userId},estudiante_id.eq.${userId}`);

  if (matchesError || !activeMatches) {
    return;
  }

  // 2. Para cada match, intentar insertar la conversación correspondiente
  for (const match of activeMatches) {
    const u1 = match.exalumno_id < match.estudiante_id ? match.exalumno_id : match.estudiante_id;
    const u2 = match.exalumno_id < match.estudiante_id ? match.estudiante_id : match.exalumno_id;

    // Insertar usando ON CONFLICT DO NOTHING
    await supabase
      .from('chatoctavio_conversaciones')
      .insert({
        tipo: 'exalumno_estudiante',
        user1_id: u1,
        user2_id: u2
      })
      .select('id')
      .maybeSingle(); // Si ya existe, no hace nada
  }
}

/**
 * Obtiene la lista de conversaciones del usuario autenticado.
 * Sincroniza previamente los matches activos.
 */
export async function chatoctavio_getConversations(): Promise<{ data: ChatOctavioConversation[] | null; error: string | null }> {
  const supabase = await createClient();
  const userRes = await chatoctavio_getCurrentUser();
  if (userRes.error || !userRes.data) {
    return { data: null, error: userRes.error };
  }
  const currentUserId = userRes.data.id;

  // Sincronizar matches activos antes de cargar la lista
  try {
    await syncActiveMatchesToConversations(currentUserId);
  } catch (err) {
    console.error('Error sincronizando matches activos:', err);
  }

  // Obtener conversaciones
  const { data: conversations, error: convError } = await supabase
    .from('chatoctavio_conversaciones')
    .select('*')
    .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
    .order('updated_at', { ascending: false });

  if (convError) {
    return { data: null, error: convError.message };
  }

  if (!conversations || conversations.length === 0) {
    return { data: [], error: null };
  }

  const result: ChatOctavioConversation[] = [];

  for (const conv of conversations) {
    const otherUserId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;

    // Obtener los datos del otro usuario
    const { data: otherUser, error: userError } = await supabase
      .from('users')
      .select('id, nombre, email, rol, foto_url')
      .eq('id', otherUserId)
      .single();

    if (userError || !otherUser) {
      continue; // Si el usuario no existe por alguna razón, lo omitimos
    }

    // Obtener el último mensaje de la conversación
    const { data: lastMessage } = await supabase
      .from('chatoctavio_mensajes')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    result.push({
      id: conv.id,
      tipo: conv.tipo as any,
      user1_id: conv.user1_id,
      user2_id: conv.user2_id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      other_user: {
        id: otherUser.id,
        nombre: otherUser.nombre,
        email: otherUser.email,
        rol: otherUser.rol as any,
        foto_url: otherUser.foto_url
      },
      last_message: lastMessage ? {
        id: lastMessage.id,
        conversation_id: lastMessage.conversation_id,
        sender_id: lastMessage.sender_id,
        contenido: lastMessage.contenido,
        created_at: lastMessage.created_at,
        leido: lastMessage.leido
      } : null
    });
  }

  // Ordenar por la fecha del último mensaje o de creación si no hay mensajes
  result.sort((a, b) => {
    const dateA = new Date(a.last_message?.created_at || a.updated_at).getTime();
    const dateB = new Date(b.last_message?.created_at || b.updated_at).getTime();
    return dateB - dateA;
  });

  return { data: result, error: null };
}

/**
 * Obtiene los mensajes de una conversación específica.
 */
export async function chatoctavio_getMessages(conversationId: string): Promise<{ data: ChatOctavioMessage[] | null; error: string | null }> {
  const supabase = await createClient();
  const userRes = await chatoctavio_getCurrentUser();
  if (userRes.error || !userRes.data) {
    return { data: null, error: userRes.error };
  }

  // Primero verificar que el usuario pertenece a la conversación (seguridad en app además de RLS)
  const { data: conv, error: convError } = await supabase
    .from('chatoctavio_conversaciones')
    .select('user1_id, user2_id')
    .eq('id', conversationId)
    .single();

  if (convError || !conv) {
    return { data: null, error: 'Conversación no encontrada' };
  }

  if (conv.user1_id !== userRes.data.id && conv.user2_id !== userRes.data.id) {
    return { data: null, error: 'No autorizado para ver estos mensajes' };
  }

  // Obtener mensajes ordenados ascendentemente
  const { data: messages, error: msgError } = await supabase
    .from('chatoctavio_mensajes')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgError) {
    return { data: null, error: msgError.message };
  }

  // Marcar los mensajes recibidos como leídos de forma asíncrona
  const unreadMessages = (messages || []).filter(m => m.sender_id !== userRes.data!.id && !m.leido);
  if (unreadMessages.length > 0) {
    await supabase
      .from('chatoctavio_mensajes')
      .update({ leido: true })
      .in('id', unreadMessages.map(m => m.id));
  }

  return { data: messages || [], error: null };
}

/**
 * Envía un mensaje en una conversación específica.
 */
export async function chatoctavio_sendMessage(conversationId: string, content: string): Promise<{ data: ChatOctavioMessage | null; error: string | null }> {
  const supabase = await createClient();
  const userRes = await chatoctavio_getCurrentUser();
  if (userRes.error || !userRes.data) {
    return { data: null, error: userRes.error };
  }

  if (!content || content.trim() === '') {
    return { data: null, error: 'El contenido del mensaje no puede estar vacío' };
  }

  // Insertar mensaje
  const { data: message, error: msgError } = await supabase
    .from('chatoctavio_mensajes')
    .insert({
      conversation_id: conversationId,
      sender_id: userRes.data.id,
      contenido: content.trim()
    })
    .select('*')
    .single();

  if (msgError) {
    return { data: null, error: msgError.message };
  }

  // Actualizar el timestamp `updated_at` de la conversación para ordenarla
  await supabase
    .from('chatoctavio_conversaciones')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return { data: message, error: null };
}

/**
 * Obtiene las solicitudes de chat (recibidas y enviadas) del estudiante autenticado.
 */
export async function chatoctavio_getRequests(): Promise<{
  data: { incoming: ChatOctavioRequest[]; outgoing: ChatOctavioRequest[] } | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const userRes = await chatoctavio_getCurrentUser();
  if (userRes.error || !userRes.data) {
    return { data: null, error: userRes.error };
  }
  const currentUserId = userRes.data.id;

  // Obtener solicitudes
  const { data: requests, error: reqError } = await supabase
    .from('chatoctavio_solicitudes')
    .select('*')
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

  if (reqError) {
    return { data: null, error: reqError.message };
  }

  const incoming: ChatOctavioRequest[] = [];
  const outgoing: ChatOctavioRequest[] = [];

  for (const req of (requests || [])) {
    const isIncoming = req.receiver_id === currentUserId;
    const otherUserId = isIncoming ? req.sender_id : req.receiver_id;

    // Obtener información del otro estudiante
    const { data: otherUser } = await supabase
      .from('users')
      .select('id, nombre, email, rol, foto_url')
      .eq('id', otherUserId)
      .single();

    if (!otherUser) continue;

    const formattedRequest: ChatOctavioRequest = {
      id: req.id,
      sender_id: req.sender_id,
      receiver_id: req.receiver_id,
      estado: req.estado as any,
      created_at: req.created_at,
      updated_at: req.updated_at,
      other_user: {
        id: otherUser.id,
        nombre: otherUser.nombre,
        email: otherUser.email,
        rol: otherUser.rol as any,
        foto_url: otherUser.foto_url
      }
    };

    if (isIncoming) {
      incoming.push(formattedRequest);
    } else {
      outgoing.push(formattedRequest);
    }
  }

  return { data: { incoming, outgoing }, error: null };
}

/**
 * Envía una solicitud de chat de estudiante a estudiante.
 */
export async function chatoctavio_sendRequest(receiverId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const userRes = await chatoctavio_getCurrentUser();
  if (userRes.error || !userRes.data) {
    return { success: false, error: userRes.error };
  }
  const currentUserId = userRes.data.id;

  if (currentUserId === receiverId) {
    return { success: false, error: 'No puedes enviarte una solicitud a ti mismo' };
  }

  // 1. Validar que ambos usuarios sean estudiantes
  const { data: receiverData, error: recError } = await supabase
    .from('users')
    .select('rol')
    .eq('id', receiverId)
    .single();

  if (recError || !receiverData) {
    return { success: false, error: 'Destinatario no encontrado' };
  }

  if (userRes.data.rol !== 'estudiante' || receiverData.rol !== 'estudiante') {
    return { success: false, error: 'Las solicitudes de chat solo están permitidas entre estudiantes' };
  }

  // 2. Verificar si ya existe una conversación activa o solicitud entre ambos
  const u1 = currentUserId < receiverId ? currentUserId : receiverId;
  const u2 = currentUserId < receiverId ? receiverId : currentUserId;

  const { data: existingConv } = await supabase
    .from('chatoctavio_conversaciones')
    .select('id')
    .eq('user1_id', u1)
    .eq('user2_id', u2)
    .maybeSingle();

  if (existingConv) {
    return { success: false, error: 'Ya existe una conversación activa con este estudiante' };
  }

  const { data: existingReq } = await supabase
    .from('chatoctavio_solicitudes')
    .select('id, estado')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`)
    .maybeSingle();

  if (existingReq) {
    if (existingReq.estado === 'pendiente') {
      return { success: false, error: 'Ya existe una solicitud pendiente entre ustedes' };
    }
    if (existingReq.estado === 'aceptada') {
      return { success: false, error: 'La solicitud ya fue aceptada previamente' };
    }
    // Si fue rechazada, permitimos enviar una nueva solicitud limpiando el registro anterior
    await supabase
      .from('chatoctavio_solicitudes')
      .delete()
      .eq('id', existingReq.id);
  }

  // 3. Crear la nueva solicitud
  const { error: insertError } = await supabase
    .from('chatoctavio_solicitudes')
    .insert({
      sender_id: currentUserId,
      receiver_id: receiverId,
      estado: 'pendiente'
    });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true, error: null };
}

/**
 * Responde a una solicitud (Aceptar o Rechazar).
 * Al aceptar, se crea automáticamente la conversación.
 */
export async function chatoctavio_respondToRequest(requestId: string, accept: boolean): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const userRes = await chatoctavio_getCurrentUser();
  if (userRes.error || !userRes.data) {
    return { success: false, error: userRes.error };
  }
  const currentUserId = userRes.data.id;

  // 1. Obtener la solicitud y verificar destinatario
  const { data: req, error: reqError } = await supabase
    .from('chatoctavio_solicitudes')
    .select('*')
    .eq('id', requestId)
    .single();

  if (reqError || !req) {
    return { success: false, error: 'Solicitud no encontrada' };
  }

  if (req.receiver_id !== currentUserId) {
    return { success: false, error: 'No estás autorizado para responder esta solicitud' };
  }

  if (req.estado !== 'pendiente') {
    return { success: false, error: 'Esta solicitud ya ha sido procesada' };
  }

  if (accept) {
    // Aceptar: actualizar estado
    const { error: updateError } = await supabase
      .from('chatoctavio_solicitudes')
      .update({ estado: 'aceptada', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Crear la conversación (user1_id < user2_id)
    const u1 = req.sender_id < req.receiver_id ? req.sender_id : req.receiver_id;
    const u2 = req.sender_id < req.receiver_id ? req.receiver_id : req.sender_id;

    const { error: convError } = await supabase
      .from('chatoctavio_conversaciones')
      .insert({
        tipo: 'estudiante_estudiante',
        user1_id: u1,
        user2_id: u2
      })
      .select('id')
      .single();

    if (convError && convError.code !== '23505') { // Ignorar error de duplicado (código SQL 23505 para UNIQUE constraint)
      return { success: false, error: 'Solicitud aceptada, pero falló al abrir la sala: ' + convError.message };
    }
  } else {
    // Rechazar: actualizar estado o eliminar
    const { error: updateError } = await supabase
      .from('chatoctavio_solicitudes')
      .update({ estado: 'rechazada', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  }

  return { success: true, error: null };
}

/**
 * Busca estudiantes por nombre o correo para permitir enviarles solicitudes de chat.
 */
export async function chatoctavio_searchStudents(queryText: string): Promise<{
  data: Array<ChatOctavioUser & { requestStatus: 'no_request' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected'; requestId?: string }> | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const userRes = await chatoctavio_getCurrentUser();
  if (userRes.error || !userRes.data) {
    return { data: null, error: userRes.error };
  }
  const currentUserId = userRes.data.id;

  if (userRes.data.rol !== 'estudiante') {
    return { data: null, error: 'Solo los estudiantes pueden buscar otros estudiantes' };
  }

  if (!queryText || queryText.trim() === '') {
    return { data: [], error: null };
  }

  // 1. Buscar estudiantes activos que coincidan con la búsqueda
  const { data: students, error: searchError } = await supabase
    .from('users')
    .select('id, nombre, email, rol, foto_url')
    .eq('rol', 'estudiante')
    .eq('activo', true)
    .neq('id', currentUserId)
    .or(`nombre.ilike.%${queryText}%,email.ilike.%${queryText}%`)
    .limit(15);

  if (searchError) {
    return { data: null, error: searchError.message };
  }

  if (!students || students.length === 0) {
    return { data: [], error: null };
  }

  const result: any[] = [];

  // 2. Obtener el estado de solicitudes de cada estudiante encontrado
  for (const std of students) {
    const { data: req } = await supabase
      .from('chatoctavio_solicitudes')
      .select('id, sender_id, receiver_id, estado')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${std.id}),and(sender_id.eq.${std.id},receiver_id.eq.${currentUserId})`)
      .maybeSingle();

    let requestStatus: 'no_request' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected' = 'no_request';

    if (req) {
      if (req.estado === 'aceptada') {
        requestStatus = 'accepted';
      } else if (req.estado === 'rechazada') {
        requestStatus = 'rejected';
      } else if (req.estado === 'pendiente') {
        requestStatus = req.sender_id === currentUserId ? 'pending_sent' : 'pending_received';
      }
    }

    result.push({
      id: std.id,
      nombre: std.nombre,
      email: std.email,
      rol: std.rol,
      foto_url: std.foto_url,
      requestStatus,
      requestId: req?.id
    });
  }

  return { data: result, error: null };
}
