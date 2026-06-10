import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function FilterSidebar() {
  const filters = [
    {
      label: 'Facultad',
      defaultOption: 'Todas las facultades',
      options: [],
    },
    {
      label: 'Escuela',
      defaultOption: 'Todas las escuelas',
      options: [],
    },
    {
      label: 'Carrera UCR',
      defaultOption: 'Todas las carreras',
      options: [],
    },
    {
      label: 'Sector',
      defaultOption: 'Todos los sectores',
      options: [
        'Tecnología e Informática',
        'Finanzas y Banca',
        'Salud y Ciencias Médicas',
        'Educación e Investigación',
      ],
    },
    {
      label: 'Tipo de Apoyo',
      defaultOption: 'Todos los tipos',
      options: [
        'Mentoría',
        'Empleo',
        'Pasantía',
        'Proyecto',
        'Donación'
      ],
    },
  ];

  return (
    <div className="w-full max-w-[280px] flex flex-col bg-white">
      <h2 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-6">
        Filtros
      </h2>
      
      <div className="flex flex-col gap-5">
        {filters.map((filter, index) => (
          <div key={index} className="flex flex-col gap-2">
            <label htmlFor={`filter-${index}`} className="text-[13px] font-medium text-slate-700">
              {filter.label}
            </label>
            <div className="relative">
              <select 
                id={`filter-${index}`}
                name={filter.label}
                title={filter.label}
                aria-label={filter.label}
                className="w-full appearance-none bg-white text-[14px] text-slate-900 border-[0.5px] border-slate-300 rounded-md py-[8px] pl-[12px] pr-[32px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm"
                defaultValue=""
              >
                <option value="">{filter.defaultOption}</option>
                {filter.options.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-[12px] pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
