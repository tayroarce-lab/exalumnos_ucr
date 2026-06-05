// =============================================================================
// CONSTANTES: Catálogo de Tipos de Proyecto (Modalidades de Graduación UCR)
// Descripción : Fuente de verdad en cliente para las cuatro modalidades de
//               graduación del sistema UCR. Alimenta selectores y filtros
//               en la interfaz sin requerir consulta a la base de datos.
// Reglas UI   : Los componentes que consuman este catálogo deben estilizarse
//               exclusivamente con clases de Tailwind CSS y gestionar
//               selecciones mediante eventos onClick/onChange.
//               Prohibido: etiquetas <form> y atributos style={{}}.
// =============================================================================

// -----------------------------------------------------------------------------
// Definición del tipo que describe cada modalidad de proyecto en el catálogo
// -----------------------------------------------------------------------------
export interface TipoProyecto {
  /** Identificador ordinal que coincide con el SERIAL de la base de datos */
  id: number;
  /** Código interno (slug) de la modalidad (ej: 'tfg', 'tesis') */
  codigo: string;
  /** Nombre completo y descriptivo de la modalidad para mostrar en la UI */
  nombre: string;
}

// =============================================================================
// [VERDE - FUNCION: TIPOS_PROYECTO]
// Array inmutable (as const) con las 4 modalidades de graduación de la UCR.
// El orden refleja la jerarquía y frecuencia de uso en el sistema académico.
// =============================================================================
export const TIPOS_PROYECTO: readonly TipoProyecto[] = [
  { id: 1, codigo: 'tfg',               nombre: 'TFG (Trabajo de Fin de Grado)' },
  { id: 2, codigo: 'tesis',             nombre: 'Tesis'                          },
  { id: 3, codigo: 'practica_dirigida', nombre: 'Práctica dirigida'              },
  { id: 4, codigo: 'seminario',         nombre: 'Seminario'                      },
] as const;

// =============================================================================
// [VERDE - FUNCION: obtenerTiposProyecto]
// Retorna una copia del array completo de tipos de proyecto.
// Útil para popular selectores y listas desplegables en la interfaz de usuario.
// =============================================================================
export function obtenerTiposProyecto(): TipoProyecto[] {
  return [...TIPOS_PROYECTO];
}

// =============================================================================
// [VERDE - FUNCION: mapearTipoProyecto]
// Busca y retorna un tipo de proyecto por su código interno (slug).
// Retorna `undefined` si el código no existe en el catálogo.
// Ejemplo: mapearTipoProyecto('tesis') -> { id: 2, codigo: 'tesis', nombre: 'Tesis' }
// =============================================================================
export function mapearTipoProyecto(codigo: string): TipoProyecto | undefined {
  return TIPOS_PROYECTO.find((tipo) => tipo.codigo === codigo);
}

// =============================================================================
// [VERDE - FUNCION: validarTipoProyecto]
// Verifica si un código dado corresponde a una modalidad válida en el catálogo.
// Retorna `true` si existe, `false` en caso contrario.
// Ejemplo: validarTipoProyecto('seminario')      -> true
//          validarTipoProyecto('proyecto_libre')  -> false
// =============================================================================
export function validarTipoProyecto(codigo: string): boolean {
  return TIPOS_PROYECTO.some((tipo) => tipo.codigo === codigo);
}
