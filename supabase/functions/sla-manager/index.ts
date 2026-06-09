import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend';

// Inicializar el cliente de Resend con la variable de entorno
const clienteResend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (_req) => {
  try {
    // Inicializar Supabase con privilegios de administrador para el cron
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const registrosEstancados = await verificarPlazosVencidos(supabase);
    const totalEstancados = registrosEstancados.donaciones.length + registrosEstancados.aplicaciones.length;

    if (totalEstancados > 0) {
      await notificarAdministradorSLA(registrosEstancados, totalEstancados);
    }

    return new Response(
      JSON.stringify({ 
        mensaje: 'Chequeo de SLA finalizado exitosamente', 
        totalProcesados: totalEstancados 
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Fallo general en Gestor de SLA:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

/**
 * Consulta a la base de datos en búsqueda de donaciones o aplicaciones estancadas.
 */
async function verificarPlazosVencidos(supabase: any) {
  const hace48Horas = new Date();
  hace48Horas.setHours(hace48Horas.getHours() - 48);
  const limiteIso = hace48Horas.toISOString();

  // Consultar Donaciones pendientes y vencidas
  const { data: donaciones, error: errDonaciones } = await supabase
    .from('donaciones')
    .select('id, created_at')
    .eq('estado', 'Pendiente')
    .lte('created_at', limiteIso);

  if (errDonaciones) console.error('Error al consultar donaciones:', errDonaciones);

  // Consultar Aplicaciones pendientes y vencidas
  const { data: aplicaciones, error: errAplicaciones } = await supabase
    .from('aplicaciones')
    .select('id, created_at')
    .eq('estado', 'Pendiente')
    .lte('created_at', limiteIso);

  if (errAplicaciones) console.error('Error al consultar aplicaciones:', errAplicaciones);

  return {
    donaciones: donaciones || [],
    aplicaciones: aplicaciones || []
  };
}

/**
 * Envía una alerta por correo sobre los registros que han incumplido el SLA.
 */
async function notificarAdministradorSLA(registros: any, total: number) {
  const cuerpoHtml = `
    <h2>🚨 Alerta Crítica de SLA (Service Level Agreement)</h2>
    <p>El sistema ha detectado <strong>${total}</strong> registros en estado "Pendiente" con más de 48 horas sin atención.</p>
    
    ${registros.donaciones.length > 0 ? `
      <h3>Donaciones Atrasadas:</h3>
      <ul>
        ${registros.donaciones.map((d: any) => `<li>ID: ${d.id} (Creado: ${new Date(d.created_at).toLocaleString()})</li>`).join('')}
      </ul>
    ` : ''}

    ${registros.aplicaciones.length > 0 ? `
      <h3>Aplicaciones Atrasadas:</h3>
      <ul>
        ${registros.aplicaciones.map((a: any) => `<li>ID: ${a.id} (Creado: ${new Date(a.created_at).toLocaleString()})</li>`).join('')}
      </ul>
    ` : ''}
    
    <p>Se requiere tu acción inmediata en el panel de administración.</p>
  `;

  await clienteResend.emails.send({
    from: 'SLA Bot <onboarding@resend.dev>', // Cambiar a dominio de producción
    to: Deno.env.get('ADMIN_EMAIL') || 'admin@tudominio.com',
    subject: `ALERTA: ${total} Registros requieren atención (> 48h Pendiente)`,
    html: cuerpoHtml,
  });
}
