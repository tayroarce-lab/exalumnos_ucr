import { FiltrosDirectorio } from "@/types/estudiantes";

export type SearchParams = { [key: string]: string | string[] | undefined };

/**
 * Normaliza un valor de searchParams asegurando que siempre devuelva un arreglo de strings.
 */
function asArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

/**
 * Extrae los filtros, búsqueda y página de los parámetros de la URL (usado por Server Components).
 */
export function parseSearchParams(sp: SearchParams): {
  filtros: FiltrosDirectorio;
  busqueda: string;
  pagina: number;
} {
  return {
    filtros: {
      carrera: asArray(sp.carrera),
      proyecto_area_tematica: asArray(sp.proyecto_area_tematica),
      areas_de_interes: asArray(sp.areas_de_interes),
      tipos_apoyo: asArray(sp.tipos_apoyo),
      proyecto_tipo: typeof sp.proyecto_tipo === 'string' ? sp.proyecto_tipo : "",
      sede: typeof sp.sede === 'string' ? sp.sede : "",
    },
    busqueda: typeof sp.busqueda === 'string' ? sp.busqueda : "",
    pagina: typeof sp.page === 'string' && !isNaN(parseInt(sp.page, 10)) ? parseInt(sp.page, 10) : 1,
  };
}

/**
 * Convierte el estado actual de la UI en un string de URL paramétrico (usado por Client Components).
 */
export function buildQueryString(filtros: FiltrosDirectorio, busqueda: string, pagina: number): string {
  const params = new URLSearchParams();

  if (busqueda) params.set("busqueda", busqueda);
  if (pagina > 1) params.set("page", pagina.toString());

  if (filtros.proyecto_tipo) params.set("proyecto_tipo", filtros.proyecto_tipo);
  if (filtros.sede) params.set("sede", filtros.sede);

  filtros.carrera.forEach(c => params.append("carrera", c));
  filtros.proyecto_area_tematica.forEach(a => params.append("proyecto_area_tematica", a));
  filtros.areas_de_interes.forEach(a => params.append("areas_de_interes", a));
  filtros.tipos_apoyo.forEach(t => params.append("tipos_apoyo", t));

  const str = params.toString();
  return str ? `?${str}` : "";
}
