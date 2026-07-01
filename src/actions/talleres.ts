'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';
import { sendTallerApprovalEmail, sendTallerApplicationResultEmail } from '@/services/email-service';

export type Taller = Database['public']['Tables']['talleres']['Row'];
export type TallerInsert = Database['public']['Tables']['talleres']['Insert'];
export type Postulacion = Database['public']['Tables']['talleres_postulaciones']['Row'];

export async function createTaller(data: TallerInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario no autenticado');

  const { data: taller, error } = await supabase
    .from('talleres')
    .insert({ ...data, exalumno_id: user.id })
    .select()
    .single();

  if (error) {
    console.error('Error al crear taller:', error);
    throw new Error('No se pudo crear el taller');
  }

  revalidatePath('/mis-talleres');
  return taller;
}

export async function getMisTalleres() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('talleres')
    .select('*')
    .eq('exalumno_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener mis talleres:', error);
    return [];
  }

  return data;
}

export async function getAllTalleresAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('talleres')
    .select(`
      *,
      users:exalumno_id (
        nombre,
        apellidos,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener talleres para admin:', error);
    return [];
  }

  return data;
}

export async function updateTallerEstadoAdmin(id: string, estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO') {
  const supabase = await createClient();

  const { data: taller, error } = await supabase
    .from('talleres')
    .update({ estado })
    .eq('id', id)
    .select(`
      *,
      users:exalumno_id (
        email
      )
    `)
    .single();

  if (error || !taller) {
    console.error('Error al actualizar estado del taller:', error);
    throw new Error('No se pudo actualizar el estado del taller');
  }

  // Notificar al exalumno in-app
  const notificationMsg = estado === 'APROBADO' 
    ? `Tu taller "${taller.titulo}" ha sido aprobado.` 
    : `Tu taller "${taller.titulo}" ha sido rechazado.`;

  await supabase.from('notificaciones').insert({
    user_id: taller.exalumno_id,
    titulo: 'Estado de tu taller actualizado',
    mensaje: notificationMsg,
    tipo: 'TALLER_STATUS',
    link: `/mis-talleres/${id}`
  });

  // Notificar por correo
  if (taller.users && (taller.users as any).email) {
    await sendTallerApprovalEmail((taller.users as any).email, taller.titulo, estado === 'APROBADO');
  }

  revalidatePath('/admin/talleres');
  revalidatePath('/mis-talleres');
  revalidatePath('/talleres');
  return taller;
}

export async function getTalleresAprobados() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('talleres')
    .select(`
      *,
      users:exalumno_id (
        nombre,
        apellidos,
        foto_url
      )
    `)
    .eq('estado', 'APROBADO')
    .order('fecha_taller', { ascending: true });

  if (error) {
    console.error('Error al obtener talleres aprobados:', error);
    return [];
  }

  return data;
}

export async function getTallerById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('talleres')
    .select(`
      *,
      users:exalumno_id (
        nombre,
        apellidos,
        foto_url
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener taller:', error);
    return null;
  }

  return data;
}

export async function postularTaller(tallerId: string, mensaje?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario no autenticado');

  // Verificar cupos disponibles
  const { data: taller } = await supabase
    .from('talleres')
    .select('cupos')
    .eq('id', tallerId)
    .single();

  if (taller?.cupos !== null && taller?.cupos !== undefined) {
    const { count } = await supabase
      .from('talleres_postulaciones')
      .select('*', { count: 'exact', head: true })
      .eq('taller_id', tallerId)
      .eq('estado', 'ACEPTADO');

    if (count !== null && count >= taller.cupos) {
      throw new Error('El taller ya no tiene cupos disponibles.');
    }
  }

  const { data: postulacion, error } = await supabase
    .from('talleres_postulaciones')
    .insert({
      taller_id: tallerId,
      estudiante_id: user.id,
      mensaje: mensaje || ''
    })
    .select()
    .single();

  if (error) {
    console.error('Error al postularse al taller:', error);
    if (error.code === '23505') {
        throw new Error('Ya estás postulado a este taller');
    }
    throw new Error('No se pudo realizar la postulación');
  }

  revalidatePath(`/talleres/${tallerId}`);
  return postulacion;
}

export async function getPostulacionesPorTaller(tallerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('talleres_postulaciones')
    .select(`
      *,
      users:estudiante_id (
        nombre,
        apellidos,
        email,
        foto_url
      )
    `)
    .eq('taller_id', tallerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener postulaciones del taller:', error);
    return [];
  }

  return data;
}

export async function responderPostulacion(postulacionId: string, estado: 'ACEPTADO' | 'RECHAZADO') {
  const supabase = await createClient();

  // Actualizar estado
  const { data: postulacion, error } = await supabase
    .from('talleres_postulaciones')
    .update({ estado })
    .eq('id', postulacionId)
    .select(`
      *,
      talleres:taller_id (
        titulo
      ),
      users:estudiante_id (
        email
      )
    `)
    .single();

  if (error || !postulacion) {
    console.error('Error al responder postulación:', error);
    throw new Error('No se pudo actualizar el estado de la postulación');
  }

  const tallerTitulo = (postulacion.talleres as any)?.titulo || 'Taller';

  // Notificar al estudiante in-app
  const notificationMsg = estado === 'ACEPTADO' 
    ? `Has sido aceptado en el taller "${tallerTitulo}".` 
    : `Tu postulación al taller "${tallerTitulo}" no fue seleccionada.`;

  await supabase.from('notificaciones').insert({
    user_id: postulacion.estudiante_id,
    titulo: 'Respuesta a tu postulación de taller',
    mensaje: notificationMsg,
    tipo: 'TALLER_APPLICATION_RESULT',
    link: `/talleres/${postulacion.taller_id}`
  });

  // Notificar por correo
  if (postulacion.users && (postulacion.users as any).email) {
    await sendTallerApplicationResultEmail((postulacion.users as any).email, tallerTitulo, estado === 'ACEPTADO');
  }

  revalidatePath(`/mis-talleres/${postulacion.taller_id}`);
  return postulacion;
}
