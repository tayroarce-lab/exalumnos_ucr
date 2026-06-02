import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminClient = createAdminClient();
    
    // Obtener fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await adminClient
      .from('posiciones')
      .update({ estado: 'cerrada', updated_at: new Date().toISOString() })
      .eq('estado', 'activa')
      .lt('fecha_limite', today)
      .select('id');

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: `Se cerraron ${data?.length || 0} posiciones vencidas.` 
    });
  } catch (error: any) {
    console.error('Error en cron close-positions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
