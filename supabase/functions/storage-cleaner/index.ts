// @ts-ignore: Deno imports
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore: Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Declaración de entorno de Deno para que el IDE deje de mostrar error "Cannot find name 'Deno'"
declare const Deno: any;

/**
 * Explora recursivamente un bucket de Supabase Storage manejando paginación.
 */
async function listarArchivosRecursivo(supabaseAdmin: any, bucket: string, path: string = ''): Promise<string[]> {
  const archivosEncontrados: string[] = [];
  const limit = 100;
  let offset = 0;
  let hayMas = true;

  while (hayMas) {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(path, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const item of data) {
      // Ignorar archivos del sistema
      if (item.name.startsWith('.')) continue;

      const fullPath = path ? `${path}/${item.name}` : item.name;

      // Si el id es nulo, significa que es una carpeta en Supabase Storage
      if (item.id === null) {
        const subArchivos = await listarArchivosRecursivo(supabaseAdmin, bucket, fullPath);
        archivosEncontrados.push(...subArchivos);
      } else {
        archivosEncontrados.push(fullPath);
      }
    }

    if (data.length < limit) {
      hayMas = false;
    } else {
      offset += limit;
    }
  }

  return archivosEncontrados;
}

serve(async (_req: any) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const bucketName = 'cvs'; 
    const archivos = await listarArchivosRecursivo(supabaseAdmin, bucketName);

    if (archivos.length === 0) {
      return new Response(JSON.stringify({ mensaje: 'El bucket está vacío' }), { status: 200 });
    }

    // Extraer los UUIDs (usuarios) de las rutas de los archivos
    // Se asume el formato: "uuid/archivo.pdf" o "uuid.pdf"
    const posiblesIds = new Set<string>();
    const mapeoArchivoUsuario = new Map<string, string>(); // { 'ruta/cv.pdf' => 'uuid' }

    for (const ruta of archivos) {
      const match = ruta.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (match) {
        posiblesIds.add(match[0]);
        mapeoArchivoUsuario.set(ruta, match[0]);
      }
    }

    const arrayPosiblesIds = Array.from(posiblesIds);
    const idsActivos = new Set<string>();

    // Consultar a la BD en lotes (batches) de 100 para no saturar memoria
    const batchSize = 100;
    for (let i = 0; i < arrayPosiblesIds.length; i += batchSize) {
      const lote = arrayPosiblesIds.slice(i, i + batchSize);
      
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .in('id', lote);

      if (error) throw error;
      if (data) {
        data.forEach((perfil: any) => idsActivos.add(perfil.id));
      }
    }

    // Identificar qué archivos pertenecen a un UUID que ya no está en la BD
    const archivosHuerfanos: string[] = [];
    mapeoArchivoUsuario.forEach((userId, ruta) => {
      if (!idsActivos.has(userId)) {
        archivosHuerfanos.push(ruta);
      }
    });

    // Eliminar los huérfanos por lotes de 100 (límite recomendado por la API de Storage)
    let totalBorrados = 0;
    for (let i = 0; i < archivosHuerfanos.length; i += batchSize) {
      const loteBorrado = archivosHuerfanos.slice(i, i + batchSize);
      const { error } = await supabaseAdmin.storage.from(bucketName).remove(loteBorrado);
      if (error) throw error;
      totalBorrados += loteBorrado.length;
    }

    return new Response(
      JSON.stringify({
        mensaje: 'Limpieza profunda finalizada con éxito',
        totalArchivosEvaluados: archivos.length,
        totalEliminados: totalBorrados,
        archivosBorrados: archivosHuerfanos
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Fallo crítico en el Garbage Collector:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
