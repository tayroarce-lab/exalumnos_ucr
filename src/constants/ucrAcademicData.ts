// Interfaces para estructurar la información académica de la UCR
export interface SedeUcr {
  id: string;
  nombre: string;
  nombreCorto: string;
}

export interface FacultadUcr {
  id: string;
  nombre: string;
}

// Datos quemados exactos de las Sedes y Recintos de la UCR
export const SEDES_UCR: SedeUcr[] = [
  { id: 'rodrigo_facio', nombre: 'Sede Rodrigo Facio (Central - San Pedro)', nombreCorto: 'Rodrigo Facio' },
  { id: 'occidente', nombre: 'Sede de Occidente (San Ramón)', nombreCorto: 'Occidente' },
  { id: 'atlantico', nombre: 'Sede del Atlántico (Turrialba)', nombreCorto: 'Atlántico' },
  { id: 'guanacaste', nombre: 'Sede de Guanacaste (Liberia)', nombreCorto: 'Guanacaste' },
  { id: 'caribe', nombre: 'Sede del Caribe (Limón)', nombreCorto: 'Caribe' },
  { id: 'pacifico', nombre: 'Sede del Pacífico (Puntarenas)', nombreCorto: 'Pacífico' },
  { id: 'sur', nombre: 'Sede del Sur (Golfito)', nombreCorto: 'Sur' },
  { id: 'interuniversitaria', nombre: 'Sede Interuniversitaria de Alajuela', nombreCorto: 'Interuniversitaria' }
];

// Datos quemados exactos de las Áreas y Facultades principales de la UCR
export const FACULTADES_UCR: FacultadUcr[] = [
  { id: 'agroalimentarias', nombre: 'Ciencias Agroalimentarias' },
  { id: 'artes_letras', nombre: 'Artes y Letras' },
  { id: 'basicas', nombre: 'Ciencias Básicas' },
  { id: 'sociales', nombre: 'Ciencias Sociales' },
  { id: 'economicas', nombre: 'Ciencias Económicas' },
  { id: 'derecho', nombre: 'Derecho' },
  { id: 'educacion', nombre: 'Educación' },
  { id: 'ingenieria', nombre: 'Ingeniería' },
  { id: 'salud', nombre: 'Salud' }
];

// [VERDE - FUNCION: obtenerSedesUcr]
// Función helper para obtener el catálogo completo de Sedes UCR
export const obtenerSedesUcr = (): SedeUcr[] => {
  return SEDES_UCR;
};

// [VERDE - FUNCION: obtenerFacultadesUcr]
// Función helper para obtener el catálogo completo de Facultades UCR
export const obtenerFacultadesUcr = (): FacultadUcr[] => {
  return FACULTADES_UCR;
};

// [VERDE - FUNCION: buscarSedesPorNombre]
// Función helper para autocompletado y filtros de búsqueda de sedes en la UI
export const buscarSedesPorNombre = (busqueda: string): SedeUcr[] => {
  const query = busqueda.toLowerCase().trim();
  return SEDES_UCR.filter(
    (sede) => 
      sede.nombre.toLowerCase().includes(query) || 
      sede.nombreCorto.toLowerCase().includes(query)
  );
};
