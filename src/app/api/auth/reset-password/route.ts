import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email, codigo, nuevaPassword } = await request.json();

    if (!email || !codigo || !nuevaPassword) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (nuevaPassword.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Buscar el código en la base de datos que no haya expirado
    const { data: resets, error: searchError } = await supabaseAdmin
      .from('password_resets')
      .select('*')
      .eq('email', email)
      .eq('codigo', codigo)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (searchError) throw searchError;

    if (!resets || resets.length === 0) {
      return NextResponse.json({ error: 'El código es inválido o ha expirado.' }, { status: 400 });
    }

    // 2. Obtener el auth.users id (tenemos que buscar el usuario por email)
    // Para simplificar, obtenemos la lista o usamos una llamada a users
    const { data: usersData, error: listError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (listError || !usersData) {
      return NextResponse.json({ error: 'Usuario no encontrado en la base de datos.' }, { status: 404 });
    }

    // 3. Actualizar la contraseña en Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      usersData.id,
      { password: nuevaPassword }
    );

    if (updateError) throw updateError;

    // 4. Eliminar el registro (y todos los anteriores de ese correo) para que no se reutilice
    await supabaseAdmin
      .from('password_resets')
      .delete()
      .eq('email', email);

    return NextResponse.json({ success: true, message: 'Contraseña actualizada con éxito.' });
  } catch (error: any) {
    console.error('Error al restablecer contraseña:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
