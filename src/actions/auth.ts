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
    user_metadata: { nombre: data.nombre, tipo: 'estudiante' }
  })

  if (authError) throw new Error(authError.message)
  
  if (authData.user) {
    // Intentar insertar en users por compatibilidad, aunque hay un trigger, el trigger inserta lo básico
    const { error: dbError } = await adminClient.from('users').insert({
      id: authData.user.id,
      email: emailLimpio,
      nombre: data.nombre,
      tipo: 'estudiante',
      rol: 'estudiante',
      email_verified: false,
      activo: true
    })
    
    // Ignoramos error 23505 (unique violation) por si ya existía un trigger en la BD que lo insertara
    if (dbError && dbError.code !== '23505') {
      console.error('Error insertando en public.users:', dbError)
    }

    // Insertar en la tabla profiles
    await adminClient.from('profiles').insert({
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
    user_metadata: { nombre: data.nombre, tipo: 'exalumno' }
  })

  if (authError) throw new Error(authError.message)
  
  if (authData.user) {
    const { error: dbError } = await adminClient.from('users').insert({
      id: authData.user.id,
      email: emailLimpio,
      nombre: data.nombre,
      tipo: 'exalumno',
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

    // Insertar en la tabla profiles
    await adminClient.from('profiles').insert({
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
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  })

  if (error) throw new Error(error.message)
  
  return { success: true }
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
