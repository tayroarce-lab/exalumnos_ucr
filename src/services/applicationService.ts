import { createClient } from '@/lib/supabase/client';
import { generarPdfAtsFriendly, DatosPerfilUCR } from './pdfService';
import { logError } from '@/lib/logger';

// =============================================================================
// SERVICIO: applicationService
// Descripción : Lógica de negocio para el flujo de aplicaciones a posiciones
//               laborales y mentorías.
// =============================================================================

export type EstadoAplicacion = 'enviada' | 'en_revision' | 'seleccionado' | 'descartado';

export interface DatosAplicacion {
  position_id: string;
  cover_message?: string;
  cv_file?: File;
  usar_perfil_ucr?: boolean;
}

export interface RespuestaServicio {
  exito: boolean;
  mensaje: string;
  datos?: unknown;
}

// [VERDE - FUNCION: enviarAplicacion]
// Permite al estudiante aplicar a una posición. Sube el CV si se provee, o 
// autogenera el PDF ATS-Friendly basado en el perfil UCR si se solicita.
export async function enviarAplicacion(datos: DatosAplicacion): Promise<RespuestaServicio> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    if (userError) logError('applicationService.ts/enviarAplicacion', userError);
    return { exito: false, mensaje: 'Usuario no autenticado' };
  }

  let cvUrl = null;

  // 1. Lógica de CV: Autogenerado vs Subido Manualmente
  if (datos.usar_perfil_ucr) {
    // Modo Autogenerado ATS-Friendly: Obtener datos de las tablas modulares
    const { data: estudianteData, error: e1 } = await supabase.from('users').select('*').eq('id', user.id).single();
    const { data: educacion, error: e2 } = await supabase.from('cv_educacion').select('*').eq('estudiante_id', user.id);
    const { data: experiencia, error: e3 } = await supabase.from('cv_experiencia').select('*').eq('estudiante_id', user.id);
    const { data: proyectos, error: e4 } = await supabase.from('cv_proyectos').select('*').eq('estudiante_id', user.id);
    const { data: habilidades, error: e5 } = await supabase.from('cv_habilidades').select('*').eq('estudiante_id', user.id).single();
    if (e1) logError('applicationService.ts/enviarAplicacion', e1, { userId: user.id });
    if (e2) logError('applicationService.ts/enviarAplicacion', e2, { userId: user.id });
    if (e3) logError('applicationService.ts/enviarAplicacion', e3, { userId: user.id });
    if (e4) logError('applicationService.ts/enviarAplicacion', e4, { userId: user.id });
    if (e5 && e5.code !== 'PGRST116') logError('applicationService.ts/enviarAplicacion', e5, { userId: user.id });

    const perfil: DatosPerfilUCR = {
      nombre: estudianteData?.nombre || user.user_metadata?.nombre || 'Estudiante UCR',
      correo: estudianteData?.email || user.email || 'sin-correo@ucr.ac.cr',
      telefono: estudianteData?.telefono,
      linkedin: estudianteData?.linkedin,
      educacion: educacion || [],
      experiencia: experiencia || [],
      proyectos: proyectos || [],
      habilidades: habilidades || null
    };

    try {
      // Generamos el PDF en buffer (memoria) usando el nuevo servicio
      const pdfBuffer = await generarPdfAtsFriendly(perfil);
      const filePath = `${user.id}/${Date.now()}_perfil_ats.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, pdfBuffer, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;
      cvUrl = filePath;
    } catch (err: any) {
      logError('applicationService.ts/enviarAplicacion', err, { userId: user.id });
      return { exito: false, mensaje: `Error autogenerando PDF: ${err.message}` };
    }

  } else if (datos.cv_file) {
    // Modo Clásico: Subir el archivo que el estudiante adjuntó
    const fileExt = datos.cv_file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}_cv.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, datos.cv_file);

    if (uploadError) {
      logError('applicationService.ts/enviarAplicacion', uploadError, { userId: user.id });
      return { exito: false, mensaje: `Error subiendo CV: ${uploadError.message}` };
    }
    cvUrl = filePath;
  }

  // 2. Insertar en la base de datos la aplicación
  const { data, error } = await supabase
    .from('applications')
    .insert({
      position_id: datos.position_id,
      student_id: user.id,
      cv_url: cvUrl,
      cover_message: datos.cover_message,
      status: 'enviada'
    })
    .select()
    .single();

  if (error) {
    logError('applicationService.ts/enviarAplicacion', error, { userId: user.id, positionId: datos.position_id });
    return { exito: false, mensaje: `No se pudo enviar la aplicación: ${error.message}` };
  }

  return { exito: true, mensaje: 'Aplicación enviada exitosamente', datos: data };
}

// [VERDE - FUNCION: cambiarEstadoAplicacion]
// Permite al exalumno avanzar la aplicación (en_revision, seleccionado, descartado).
export async function cambiarEstadoAplicacion(
  aplicacionId: string, 
  nuevoEstado: EstadoAplicacion,
  positionId?: string,
  cerrarPosicion?: boolean
): Promise<RespuestaServicio> {
  const supabase = createClient();

  const { error } = await supabase
    .from('applications')
    .update({ 
      status: nuevoEstado,
      updated_at: new Date().toISOString()
    })
    .eq('id', aplicacionId);

  if (error) {
    logError('applicationService.ts/cambiarEstadoAplicacion', error, { aplicacionId });
    return { exito: false, mensaje: `Error al actualizar estado: ${error.message}` };
  }

  // Si selecciona a alguien y aprueba cerrar la posición, descarta automáticamente al resto
  if (nuevoEstado === 'seleccionado' && positionId && cerrarPosicion) {
    await supabase
      .from('applications')
      .update({ 
        status: 'descartado',
        updated_at: new Date().toISOString()
      })
      .eq('position_id', positionId)
      .neq('id', aplicacionId); // Excluye al seleccionado

    // Opcional: Actualizar el estado de la tabla posiciones a "cerrada"
    await supabase
      .from('posiciones')
      .update({ estado: 'cerrada' })
      .eq('id', positionId);
  }

  return { exito: true, mensaje: `Estado actualizado a "${nuevoEstado}"` };
}

// [VERDE - FUNCION: retirarAplicacion]
// Permite al estudiante cancelar su aplicación SOLO si está en estado 'enviada'.
export async function retirarAplicacion(aplicacionId: string): Promise<RespuestaServicio> {
  const supabase = createClient();

  // RLS garantiza que solo pueda borrar si le pertenece y status='enviada'
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', aplicacionId);

  if (error) {
    logError('applicationService.ts/retirarAplicacion', error, { aplicacionId });
    return { exito: false, mensaje: `No se puede retirar la aplicación: ${error.message}` };
  }

  return { exito: true, mensaje: 'Aplicación retirada exitosamente' };
}
