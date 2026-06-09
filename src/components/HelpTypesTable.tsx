import React from 'react';

// Interfaz para definir la estructura de los datos de cada tipo de ayuda
interface TipoAyuda {
  id: string;
  tipo: string;
  descripcion: string;
}

// Datos quemados extraídos de la sección 1.4
const datosAyuda: TipoAyuda[] = [
  {
    id: 'mentoria',
    tipo: 'Mentoría',
    descripcion: 'Tiempo y conocimiento para guiar un proyecto',
  },
  {
    id: 'empleo',
    tipo: 'Empleo',
    descripcion: 'Oferta de trabajo formal mientras el estudiante estudia',
  },
  {
    id: 'pasantia',
    tipo: 'Pasantía',
    descripcion: 'Práctica profesional relacionada con el proyecto',
  },
  {
    id: 'proyecto_empresarial',
    tipo: 'Proyecto empresarial',
    descripcion: 'Colaboración en proyecto de tesis/TFG con empresa',
  },
  {
    id: 'donacion_economica',
    tipo: 'Donación económica',
    descripcion: 'Aporte monetario directo al proyecto o fondo general',
  },
];

// [VERDE - FUNCION: renderizarFilaAyuda]
// Sub-función encargada de renderizar cada fila de la tabla con los estilos de Tailwind CSS
const renderizarFilaAyuda = (ayuda: TipoAyuda, indice: number) => {
  return (
    <tr 
      key={ayuda.id} 
      className={`${indice % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors border-b border-gray-200`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {ayuda.tipo}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {ayuda.descripcion}
      </td>
    </tr>
  );
};

// [VERDE - FUNCION: TablaTiposAyuda]
// Componente principal que estructura y renderiza la tabla completa
export const TablaTiposAyuda = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">
            Tipos de Contribución / Ayuda
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Diferentes formas en las que los exalumnos pueden apoyar a los estudiantes.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/3"
                >
                  Tipo de Ayuda
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-2/3"
                >
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datosAyuda.map((ayuda, index) => renderizarFilaAyuda(ayuda, index))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TablaTiposAyuda;
