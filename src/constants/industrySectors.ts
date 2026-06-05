// Interfaz para definir la estructura de cada sector industrial
export interface SectorIndustria {
  id: string;
  nombre: string;
}

// Catálogo inmutable de Sectores Industriales para selectores múltiples
export const SECTORES_INDUSTRIA: ReadonlyArray<SectorIndustria> = [
  { id: 'tecnologia_ti', nombre: 'Tecnología, Software y TI' },
  { id: 'finanzas_banca', nombre: 'Finanzas, Banca y Seguros' },
  { id: 'salud_medicina', nombre: 'Salud, Médica y Farmacéutica' },
  { id: 'ingenieria_construccion', nombre: 'Ingeniería, Construcción y Arquitectura' },
  { id: 'educacion_academia', nombre: 'Educación y Academia' },
  { id: 'manufactura_industria', nombre: 'Manufactura y Producción' },
  { id: 'logistica_transporte', nombre: 'Logística, Transporte y Distribución' },
  { id: 'turismo_hospitalidad', nombre: 'Turismo, Hotelería y Gastronomía' },
  { id: 'agro_alimentos', nombre: 'Agropecuario y Alimentos' },
  { id: 'comercio_retail', nombre: 'Comercio, Ventas y Retail' },
  { id: 'gobierno_publico', nombre: 'Gobierno y Sector Público' },
  { id: 'servicios_profesionales', nombre: 'Consultoría y Servicios Profesionales' }
] as const;

// [VERDE - FUNCION: obtenerSectoresIndustria]
// Función de ayuda que devuelve la lista inmutable de todos los sectores de industria
export const obtenerSectoresIndustria = (): readonly SectorIndustria[] => {
  return SECTORES_INDUSTRIA;
};

// [VERDE - FUNCION: buscarSectorPorCodigo]
// Función de ayuda para obtener el objeto completo de un sector según su código o slug
export const buscarSectorPorCodigo = (idABuscar: string): SectorIndustria | undefined => {
  return SECTORES_INDUSTRIA.find(sector => sector.id === idABuscar);
};

// [VERDE - FUNCION: mapearSectoresMultiples]
// Función de ayuda para convertir un arreglo de IDs a sus nombres legibles (útil para la UI)
export const mapearSectoresMultiples = (ids: string[]): string[] => {
  return ids
    .map(id => buscarSectorPorCodigo(id)?.nombre)
    .filter((nombre): nombre is string => nombre !== undefined);
};
