import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/client';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'El correo es requerido' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Validar que el usuario exista y obtener su tipo
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, tipo')
      .eq('email', email);

    if (userError) throw userError;

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'El correo electrónico no se encuentra registrado en el sistema.' }, { status: 404 });
    }

    const tipoUsuario = users[0].tipo;

    // 2. Generar código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Expiración de 5 minutos
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // 4. Guardar en password_resets
    const { error: insertError } = await supabaseAdmin
      .from('password_resets')
      .insert({
        email,
        codigo,
        expires_at: expiresAt
      });

    if (insertError) throw insertError;

    // 5. Enviar el correo usando Resend
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #00b0f0;">Recuperación de Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña en la plataforma Alumni UCR.</p>
        <p>Tu código de seguridad de 6 dígitos es:</p>
        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #1f2937;">${codigo}</h1>
        </div>
        <p style="color: #ef4444; font-size: 14px;">⚠️ Este código expirará en exactamente 5 minutos.</p>
        <p>Si no solicitaste este código, puedes ignorar este correo de forma segura.</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: email,
      subject: 'Código de Recuperación - Alumni UCR',
      html: htmlBody
    });

    if (!emailResult.success) {
      throw new Error('No se pudo enviar el correo.');
    }

    return NextResponse.json({ success: true, message: 'Código enviado con éxito.', tipo: tipoUsuario });
  } catch (error: any) {
    console.error('Error al solicitar código:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
