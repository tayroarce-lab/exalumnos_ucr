// @ts-ignore: Deno imports
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore: Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Declaración de entorno para Deno (evita error "Cannot find name 'Deno'" en IDEs estrictos)
declare const Deno: any;

serve(async (_req: any) => {
  try {
    // Inicializar cliente de Supabase con Service Role (necesario para updates masivos sin RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resultado = await cerrarVacantesVencidas(supabaseAdmin);

    return new Response(
      JSON.stringify({
        mensaje: 'Worker finalizado: actualización de vacantes vencidas completada',
        registrosAfectados: resultado.totalCerradas
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error crítico en el Worker vacancy-closer:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

/**
 * Busca todas las posiciones activas/abiertas cuya fecha límite ya pasó
 * y realiza un UPDATE masivo cambiando su estado a 'cerrada'.
 */
async function cerrarVacantesVencidas(supabase: any) {
  const fechaActualIso = new Date().toISOString();

  // Ejecutar el UPDATE masivo en la tabla 'positions'
  const { data, error } = await supabase
    .from('positions')
    .update({ estado: 'cerrada' })
    .in('estado', ['abierta', 'activa']) // Filtramos solo las que aún están abiertas
    .lte('fecha_limite', fechaActualIso) // Fecha límite es menor o igual a AHORA
    .select('id'); // Retornamos solo los IDs para minimizar el payload

  if (error) {
    throw new Error(`Fallo al ejecutar el update masivo: ${error.message}`);
  }

  return {
    totalCerradas: data ? data.length : 0
  };
}
