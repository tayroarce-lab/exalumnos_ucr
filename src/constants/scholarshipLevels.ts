// =============================================================================
// CONSTANTES: Catálogo de Niveles de Beca Socioeconómica UCR
// Descripción : Fuente de verdad en cliente para los niveles de beca del
//               sistema UCR. Alimenta selectores y filtros de la interfaz
//               sin necesidad de consultar la base de datos en cada render.
// Reglas UI   : Los componentes que consuman este catálogo deben usar clases
//               de Tailwind CSS para estilos y eventos onClick para
//               interacciones. Prohibido uso de <form> e inline styles.
// =============================================================================

// -----------------------------------------------------------------------------
// Definición del tipo que describe cada nivel de beca en el catálogo
// -----------------------------------------------------------------------------
export interface NivelBeca {
  /** Identificador ordinal que coincide con el SERIAL de la base de datos */
  id: number;
  /** Código interno del sistema UCR (clave de negocio, ej: 'beca_1') */
  codigo: string;
  /** Nombre legible para mostrar en la interfaz de usuario */
  nombre: string;
}

// =============================================================================
// [VERDE - FUNCION: NIVELES_BECA]
// Array inmutable (as const) con los 6 niveles del catálogo de becas UCR.
// El orden refleja la jerarquía del sistema: de menor a mayor beneficio.
// =============================================================================
export const NIVELES_BECA: readonly NivelBeca[] = [
  { id: 1, codigo: 'sin_beca', nombre: 'Sin beca' },
  { id: 2, codigo: 'beca_1',   nombre: 'Beca 1'   },
  { id: 3, codigo: 'beca_2',   nombre: 'Beca 2'   },
  { id: 4, codigo: 'beca_3',   nombre: 'Beca 3'   },
  { id: 5, codigo: 'beca_4',   nombre: 'Beca 4'   },
  { id: 6, codigo: 'beca_5',   nombre: 'Beca 5'   },
] as const;

// =============================================================================
// [VERDE - FUNCION: obtenerNivelesBeca]
// Retorna una copia del array completo de niveles de beca.
// Útil para popular <select> u otros elementos de selección en la UI.
// =============================================================================
export function obtenerNivelesBeca(): NivelBeca[] {
  return [...NIVELES_BECA];
}

// =============================================================================
// [VERDE - FUNCION: validarNivelBeca]
// Verifica si un código dado corresponde a un nivel de beca válido en el
// catálogo. Retorna `true` si existe, `false` en caso contrario.
// Ejemplo: validarNivelBeca('beca_3') -> true
//          validarNivelBeca('beca_9') -> false
// =============================================================================
export function validarNivelBeca(codigo: string): boolean {
  return NIVELES_BECA.some((nivel) => nivel.codigo === codigo);
}

// =============================================================================
// [VERDE - FUNCION: obtenerNivelBecaPorCodigo]
// Busca y retorna un nivel de beca por su código interno.
// Retorna `undefined` si el código no existe en el catálogo.
// Ejemplo: obtenerNivelBecaPorCodigo('sin_beca') -> { id: 1, codigo: 'sin_beca', nombre: 'Sin beca' }
// =============================================================================
export function obtenerNivelBecaPorCodigo(codigo: string): NivelBeca | undefined {
  return NIVELES_BECA.find((nivel) => nivel.codigo === codigo);
}
