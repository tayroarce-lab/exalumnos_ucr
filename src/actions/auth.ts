'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function registrarEstudiante(data: { email: string; password: string; nombre: string }) {
  const emailLimpio = data.email.trim().toLowerCase()
  if (emailLimpio.endsWith('@gmail.com')) {
    throw new Error('Los correos de Gmail no están permitidos para estudiantes.')
  }
  if (!emailLimpio.endsWith('@ucr.ac.cr')) {
    throw new Error('El correo debe terminar en @ucr.ac.cr')
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: emailLimpio,
    password: data.password,
    email_confirm: true,
    user_metadata: { nombre: data.nombre, rol: 'estudiante', tipo: 'estudiante' }
  })

  if (authError) throw new Error(authError.message)

  if (authData.user) {
    // Intentar insertar en users por compatibilidad, aunque hay un trigger, el trigger inserta lo básico
    const { error: dbError } = await adminClient.from('users').insert({
      id: authData.user.id,
      email: emailLimpio,
      nombre: data.nombre,
      rol: 'estudiante',
      email_verified: false,
      activo: true
    })

    // Ignoramos error 23505 (unique violation) por si ya existía un trigger en la BD que lo insertara
    if (dbError && dbError.code !== '23505') {
      console.error('Error insertando en public.users:', dbError)
    }

    // Upsert en la tabla profiles por si el trigger ya lo creó
    await adminClient.from('profiles').upsert({
      id: authData.user.id,
      email: emailLimpio,
      full_name: data.nombre,
      es_exalumno: false,
      created_at: new Date().toISOString()
    })
  }

  return { success: true }
}

export async function registrarExalumno(data: {
  email: string;
  password: string;
  nombre: string;
  carreras: number[];
  anio_graduacion: number;
}) {
  const emailLimpio = data.email.trim().toLowerCase()
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: emailLimpio,
    password: data.password,
    email_confirm: true,
    user_metadata: { nombre: data.nombre, rol: 'exalumno', tipo: 'exalumno' }
  })

  if (authError) throw new Error(authError.message)

  if (authData.user) {
    const { error: dbError } = await adminClient.from('users').insert({
      id: authData.user.id,
      email: emailLimpio,
      nombre: data.nombre,
      rol: 'exalumno',
      carrera_principal_id: data.carreras && data.carreras.length > 0 ? data.carreras[0] : null,
      email_verified: false,
      activo: true
    })

    if (dbError && dbError.code !== '23505') {
      console.error('Error insertando en public.users:', dbError)
    }

    // Preparar datos academicos para perfiles
    const academic = data.carreras.map(cId => ({
      carrera: cId.toString(), // Idealmente buscaríamos el nombre, pero guardamos el ID como string temporalmente
      escuela: '',
      anio: data.anio_graduacion.toString()
    }))

    // Upsert en la tabla profiles por si el trigger ya lo creó con valores por defecto
    await adminClient.from('profiles').upsert({
      id: authData.user.id,
      email: emailLimpio,
      full_name: data.nombre,
      academic: academic,
      es_exalumno: true,
      created_at: new Date().toISOString()
    })
  }

  return { success: true }
}

export async function iniciarSesion(data: { email: string; password: string }) {
  const supabase = await createClient()
  // IMPORTANTE: usamos adminClient para consultar el rol ya que bypasea RLS.
  // El cliente anon/autenticado regular es bloqueado por las políticas RLS de
  // la tabla users cuando se ejecuta en contexto de Server Action recién creado.
  const adminClient = createAdminClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) return { success: false, error: error.message }
  if (!authData.user) return { success: false, error: 'No se pudo obtener el usuario' }

  // Consultar el rol usando adminClient (service_role) para bypasear RLS.
  // Esto garantiza que siempre se obtendrá el rol correcto sin importar las
  // políticas de seguridad activas en ese momento.
  const { data: userData, error: userError } = await adminClient
    .from('users')
    .select('rol, activo')
    .eq('id', authData.user.id)
    .single()

  if (userError || !userData) {
    // Si el usuario no existe en public.users todavía (race condition con trigger),
    // cerramos sesión para forzar un estado limpio y evitar un estado indefinido.
    await supabase.auth.signOut()
    return { success: false, error: 'No se encontró el perfil del usuario. Intenta de nuevo en un momento.' }
  }

  // Si la cuenta está suspendida, cerrar sesión y lanzar error
  if (userData.activo === false) {
    await supabase.auth.signOut()
    return { success: false, error: 'Tu cuenta ha sido suspendida. Contacta al administrador.' }
  }

  // Determinar la ruta de destino según el rol
  const rol = userData.rol ?? 'estudiante'

  let rutaDestino: string
  if (rol === 'admin') {
    rutaDestino = '/admin'
  } else if (rol === 'exalumno') {
    rutaDestino = '/dashboard'
  } else {
    // estudiante -> va directo al directorio de exalumnos
    rutaDestino = '/network'
  }

  return { success: true, rol, rutaDestino }
}

export async function cerrarSesion() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function solicitarRecuperacionContrasena(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function enviarEnlaceMagico(email: string, role: "estudiante" | "exalumno") {
  if (role === "estudiante" && !email.endsWith("@ucr.ac.cr")) {
    throw new Error("Los estudiantes deben usar su correo institucional (@ucr.ac.cr).");
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback`,
    },
  })

  if (error) throw new Error("Hubo un error al intentar enviar el enlace mágico. Inténtalo de nuevo.")

  return { success: true }
}
