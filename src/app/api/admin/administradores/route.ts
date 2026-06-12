import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Obtenemos los usuarios con rol admin de public.users
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, nombre, apellidos, rol, created_at')
      .eq('rol', 'admin')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error al obtener administradores:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, nombre, apellidos } = await request.json();
    
    if (!email || !password || !nombre || !apellidos) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        rol: 'admin',
        nombre,
        apellidos,
      }
    });

    if (error) throw error;

    return NextResponse.json({ data: data.user }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear administrador:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
