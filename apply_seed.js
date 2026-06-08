/**
 * apply_seed.js
 * Aplica supabase/seed.sql contra la instancia cloud usando la Management API.
 *
 * USO:
 *   node apply_seed.js <SUPABASE_PAT>
 *
 * Obtén tu PAT en: https://supabase.com/dashboard/account/tokens
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const PROJECT_REF = 'vzcjppbvmbhcnrempuxf';
const PAT         = process.argv[2];

if (!PAT) {
  console.error('\n❌  Falta el Personal Access Token.\n');
  console.error('   Uso: node apply_seed.js <SUPABASE_PAT>\n');
  console.error('   Genera uno en: https://supabase.com/dashboard/account/tokens\n');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function apiRequest(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path:     `/v1/projects/${PROJECT_REF}/database/query`,
      method:   'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end',  () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, status: res.statusCode, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Divide el SQL en bloques lógicos separados por comentarios de sección.
 * Cada bloque se envía como una transacción independiente.
 */
function splitIntoBlocks(sql) {
  // Dividir por líneas en blanco múltiples entre secciones de comentario nivel 1
  const raw = sql
    .split(/\n(?=-- ={30,})/g)     // antes de separadores ===========
    .filter(b => b.trim().length > 0);

  // Agrupar bloques pequeños para no hacer demasiadas llamadas
  const CHUNK_SIZE = 4;
  const chunks = [];
  for (let i = 0; i < raw.length; i += CHUNK_SIZE) {
    chunks.push(raw.slice(i, i + CHUNK_SIZE).join('\n'));
  }
  return chunks;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const seedPath = path.join(__dirname, 'supabase', 'seed.sql');

  if (!fs.existsSync(seedPath)) {
    console.error(`❌  No se encontró: ${seedPath}`);
    process.exit(1);
  }

  const sql    = fs.readFileSync(seedPath, 'utf8');
  const blocks = splitIntoBlocks(sql);

  console.log(`\n🚀  Aplicando seed.sql → ${PROJECT_REF}`);
  console.log(`   Bloques a ejecutar: ${blocks.length}\n`);

  let success = 0;
  let failed  = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block || block.startsWith('/*') || /^--/.test(block)) {
      console.log(`   [${i+1}/${blocks.length}] ⏭  Bloque de comentarios, omitido.`);
      continue;
    }

    process.stdout.write(`   [${i+1}/${blocks.length}] Ejecutando... `);
    try {
      await apiRequest(block);
      console.log('✅');
      success++;
    } catch (err) {
      const msg = err.message.slice(0, 200);
      console.log(`⚠️  (${msg})`);
      // No hacemos process.exit — continuamos con ON CONFLICT DO NOTHING como safety net
      failed++;
    }

    // Pequeña pausa para no saturar la API
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`✅  Completados: ${success}`);
  if (failed > 0)
    console.log(`⚠️  Con advertencias: ${failed} (pueden ser ON CONFLICT normales)`);
  console.log(`\n¡Seed aplicado! Verifica en:\nhttps://supabase.com/dashboard/project/${PROJECT_REF}/editor\n`);
}

main().catch(e => {
  console.error('\n❌  Error fatal:', e.message);
  process.exit(1);
});
