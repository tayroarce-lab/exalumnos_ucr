import { createClient } from '@/lib/supabase/client';

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
}

export interface RespuestaServicio {
  exito: boolean;
  mensaje: string;
  datos?: unknown;
}

// [VERDE - FUNCION: enviarAplicacion]
// Permite al estudiante aplicar a una posición. Sube el CV si se provee.
export async function enviarAplicacion(datos: DatosAplicacion): Promise<RespuestaServicio> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { exito: false, mensaje: 'Usuario no autenticado' };
  }

  let cvUrl = null;

  // Subir el CV si el usuario adjuntó un archivo
  if (datos.cv_file) {
    const fileExt = datos.cv_file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}_cv.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, datos.cv_file);

    if (uploadError) {
      return { exito: false, mensaje: `Error subiendo CV: ${uploadError.message}` };
    }
    cvUrl = filePath;
  }

  // Insertar en la base de datos
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
    // Si hay duplicado, saltará el error del constraint UNIQUE
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
    return { exito: false, mensaje: `No se puede retirar la aplicación: ${error.message}` };
  }

  return { exito: true, mensaje: 'Aplicación retirada exitosamente' };
}
