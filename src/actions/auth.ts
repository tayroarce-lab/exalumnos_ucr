'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function registrarEstudiante(data: { email: string; password: string; nombre: string }) {
  if (data.email.toLowerCase().endsWith('@gmail.com')) {
    throw new Error('Los correos de Gmail no están permitidos para estudiantes.')
  }
  if (!data.email.endsWith('@ucr.ac.cr')) {
    throw new Error('El correo debe terminar en @ucr.ac.cr')
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { nombre: data.nombre, tipo: 'estudiante' } }
  })

  if (authError) throw new Error(authError.message)
  
  if (authData.user) {
    // Insertar en public.users con client admin para sobrepasar RLS si el usuario aún no está confirmado
    const { error: dbError } = await adminClient.from('users').insert({
      id: authData.user.id,
      email: data.email,
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
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { nombre: data.nombre, tipo: 'exalumno' } }
  })

  if (authError) throw new Error(authError.message)
  
  if (authData.user) {
    const { error: dbError } = await adminClient.from('users').insert({
      id: authData.user.id,
      email: data.email,
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
  
  revalidatePath('/', 'layout')
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
