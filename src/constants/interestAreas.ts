// Interfaz para definir la estructura de cada área de interés
export interface AreaInteres {
  id: string;
  codigo: string;
  nombre: string;
}

// Catálogo inmutable de las 14 Áreas de Interés para selectores múltiples y chips de etiquetas
export const AREAS_INTERES: ReadonlyArray<AreaInteres> = [
  { id: 'tecnologia',      codigo: 'tecnologia',      nombre: 'Tecnología e Innovación' },
  { id: 'salud',           codigo: 'salud',           nombre: 'Salud y Bienestar' },
  { id: 'educacion',       codigo: 'educacion',       nombre: 'Educación y Pedagogía' },
  { id: 'ambiente',        codigo: 'ambiente',        nombre: 'Medio Ambiente y Sostenibilidad' },
  { id: 'arte_cultura',    codigo: 'arte_cultura',    nombre: 'Arte y Cultura' },
  { id: 'ciencias_sociales', codigo: 'ciencias_sociales', nombre: 'Ciencias Sociales' },
  { id: 'agro',            codigo: 'agro',            nombre: 'Agro y Alimentación' },
  { id: 'emprendimiento',  codigo: 'emprendimiento',  nombre: 'Emprendimiento y Negocios' },
  { id: 'ingenieria',      codigo: 'ingenieria',      nombre: 'Ingeniería y Construcción' },
  { id: 'derecho',         codigo: 'derecho',         nombre: 'Derecho y Política Pública' },
  { id: 'economia',        codigo: 'economia',        nombre: 'Economía y Finanzas' },
  { id: 'comunicacion',    codigo: 'comunicacion',    nombre: 'Comunicación y Medios' },
  { id: 'turismo',         codigo: 'turismo',         nombre: 'Turismo y Patrimonio' },
  { id: 'investigacion',   codigo: 'investigacion',   nombre: 'Investigación Científica' }
] as const;

// [VERDE - FUNCION: obtenerAreasInteres]
// Función helper que devuelve el catálogo completo de áreas de interés
export const obtenerAreasInteres = (): readonly AreaInteres[] => {
  return AREAS_INTERES;
};

// [VERDE - FUNCION: buscarAreaPorCodigo]
// Función helper que retorna el objeto completo de un área según su código/slug
export const buscarAreaPorCodigo = (codigo: string): AreaInteres | undefined => {
  return AREAS_INTERES.find(area => area.codigo === codigo);
};

// [VERDE - FUNCION: mapearAreasMultiples]
// Función helper para convertir un arreglo de códigos a sus nombres legibles (útil en la UI)
export const mapearAreasMultiples = (codigos: string[]): string[] => {
  return codigos
    .map(codigo => buscarAreaPorCodigo(codigo)?.nombre)
    .filter((nombre): nombre is string => nombre !== undefined);
};
