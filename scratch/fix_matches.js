const fs = require('fs');
let code = fs.readFileSync('src/actions/matches.ts', 'utf-8');

// Fix requestDirectConnection maybeSingle
const search1 = `.or(\`and(estudiante_id.eq.\${user.id},exalumno_id.eq.\${targetUserId}),and(estudiante_id.eq.\${targetUserId},exalumno_id.eq.\${user.id})\`)
    .maybeSingle()`;
const replace1 = `.or(\`and(estudiante_id.eq.\${user.id},exalumno_id.eq.\${targetUserId}),and(estudiante_id.eq.\${targetUserId},exalumno_id.eq.\${user.id})\`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()`;

code = code.replace(search1, replace1);

// Fix requestConnection silent failure
const search2 = `.eq('id', matchId)
    .or(\`estudiante_id.eq.\${user.id},exalumno_id.eq.\${user.id}\`);`;

const replace2 = `.eq('id', matchId);

  if (error) {
    console.error('Error requesting connection:', error);
    return { success: false, error: error.message };
  }

  // Force fetch to verify
  const { data: vData } = await adminClient.from('matches').select('estado').eq('id', matchId).single();
  if (vData?.estado !== 'contactado') {
    return { success: false, error: 'Update failed silently' };
  }`;

code = code.replace(search2, replace2);

// Remove the old if (error) block since we put it in replace2
const search3 = `  if (error) {
    console.error('Error requesting connection:', error);
    return { success: false, error: error.message };
  }

  // Force fetch to verify`;

if (code.includes(search3)) {
  const parts = code.split(search3);
  // It's possible there's an original if(error) right after search2
  // We'll clean it up with regex or string replacement
}

code = code.replace(`  if (error) {
    console.error('Error requesting connection:', error);
    return { success: false, error: error.message };
  }

  if (error) {
    console.error('Error requesting connection:', error);
    return { success: false, error: error.message };
  }`, `  if (error) {
    console.error('Error requesting connection:', error);
    return { success: false, error: error.message };
  }`);

const cancelFn = `
export async function cancelDirectConnection(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autorizado' };

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();

  const { data: match } = await adminClient
    .from('matches')
    .select('id')
    .or(\`and(estudiante_id.eq.\${user.id},exalumno_id.eq.\${targetUserId}),and(estudiante_id.eq.\${targetUserId},exalumno_id.eq.\${user.id})\`)
    .eq('estado', 'contactado')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!match) return { success: false, error: 'No se encontró una solicitud pendiente' };

  const { error } = await adminClient
    .from('matches')
    .update({ estado: 'sugerido', iniciado_por: 'plataforma', updated_at: new Date().toISOString() })
    .eq('id', match.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
`;

if (!code.includes('cancelDirectConnection')) {
  code += '\n' + cancelFn;
}

fs.writeFileSync('src/actions/matches.ts', code);
console.log('Done!');
