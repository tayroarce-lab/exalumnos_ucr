"use client";

import React, { useState } from 'react';
import { Check, X, Info } from 'lucide-react';

// Interfaz para la definición de los tipos de usuario
interface TipoUsuario {
  id: string;
  rol: string;
  descripcion: string;
  validacion: string;
}

// Interfaz para la definición de los permisos por rol
interface PermisoRol {
  id: string;
  accion: string;
  estudiante: string | boolean;
  exalumno: string | boolean;
  admin: string | boolean;
}

// Datos quemados para la sección 2.1
const datosUsuarios: TipoUsuario[] = [
  {
    id: 'estudiante',
    rol: 'Estudiante',
    descripcion: 'Alumno activo UCR con proyecto de graduación',
    validacion: 'Correo institucional @ucr.ac.cr (magic link)'
  },
  {
    id: 'exalumno',
    rol: 'Exalumno',
    descripcion: 'Egresado de la UCR dispuesto a contribuir',
    validacion: 'Autodeclaración + confirmación de correo personal'
  },
  {
    id: 'admin',
    rol: 'Administrador',
    descripcion: 'Personal de la Fundación que gestiona la plataforma',
    validacion: 'Cuenta creada manualmente por otro administrador'
  }
];

// Datos quemados para la sección 2.2
const datosPermisos: PermisoRol[] = [
  { id: 'p1', accion: 'Ver directorio de exalumnos', estudiante: true, exalumno: true, admin: true },
  { id: 'p2', accion: 'Ver directorio de estudiantes', estudiante: true, exalumno: true, admin: true },
  { id: 'p3', accion: 'Ver datos sensibles del estudiante (beca)', estudiante: 'Solo el propio', exalumno: 'Solo tras aceptar contacto', admin: true },
  { id: 'p4', accion: 'Iniciar contacto / match', estudiante: true, exalumno: true, admin: true },
  { id: 'p5', accion: 'Donar dinero', estudiante: false, exalumno: true, admin: false },
  { id: 'p6', accion: 'Confirmar donaciones', estudiante: false, exalumno: false, admin: true },
  { id: 'p7', accion: 'Ver panel de reportes', estudiante: false, exalumno: false, admin: true },
  { id: 'p8', accion: 'Gestionar usuarios', estudiante: false, exalumno: false, admin: true },
  { id: 'p9', accion: 'Reportar perfiles', estudiante: true, exalumno: true, admin: true }
];

// [VERDE - FUNCION: obtenerIconoPermiso]
// Función que interpreta el valor del permiso y devuelve un ícono o texto renderizado con Tailwind
const obtenerIconoPermiso = (valor: string | boolean) => {
  if (valor === true) {
    return <Check className="w-5 h-5 text-green-500 mx-auto" aria-label="Permitido" />;
  }
  if (valor === false) {
    return <X className="w-5 h-5 text-red-500 mx-auto" aria-label="No permitido" />;
  }
  // Si es un texto específico
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
      <Info className="w-3 h-3" />
      {valor}
    </span>
  );
};

// [VERDE - FUNCION: renderizarTablaUsuarios]
// Sub-función que renderiza la lista detallada de Tipos de Usuario
const renderizarTablaUsuarios = () => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rol</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Descripción</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Validación</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {datosUsuarios.map((usuario) => (
            <tr key={usuario.id} className="hover:bg-blue-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
                {usuario.rol}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {usuario.descripcion}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 italic">
                {usuario.validacion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// [VERDE - FUNCION: renderizarMatrizPermisos]
// Sub-función que renderiza la matriz de Permisos cruzados por Rol
const renderizarMatrizPermisos = () => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Permiso / Acción</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Estudiante</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Exalumno</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Admin</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {datosPermisos.map((permiso) => (
            <tr key={permiso.id} className="hover:bg-blue-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {permiso.accion}
              </td>
              <td className="px-6 py-4 text-center whitespace-nowrap">
                {obtenerIconoPermiso(permiso.estudiante)}
              </td>
              <td className="px-6 py-4 text-center whitespace-nowrap">
                {obtenerIconoPermiso(permiso.exalumno)}
              </td>
              <td className="px-6 py-4 text-center whitespace-nowrap">
                {obtenerIconoPermiso(permiso.admin)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// [VERDE - FUNCION: CuadroControlRoles]
// Componente principal interactivo que maneja las pestañas y estructura el contenido
export const CuadroControlRoles = () => {
  const [pestanaActiva, setPestanaActiva] = useState<'usuarios' | 'permisos'>('usuarios');

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Encabezado del Componente */}
        <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Arquitectura de Roles y Permisos
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Gestión centralizada de los tipos de usuario de la plataforma y su matriz de acceso a las funcionalidades principales.
          </p>
        </div>
        
        {/* Navegación por pestañas */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex space-x-4">
          <button
            onClick={() => setPestanaActiva('usuarios')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              pestanaActiva === 'usuarios' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tipos de Usuario
          </button>
          <button
            onClick={() => setPestanaActiva('permisos')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              pestanaActiva === 'permisos' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Matriz de Permisos
          </button>
        </div>

        {/* Contenedor Dinámico de Tablas */}
        <div className="p-6 bg-gray-50/50">
          {pestanaActiva === 'usuarios' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sección 2.1: Tipos de Usuario</h3>
              {renderizarTablaUsuarios()}
            </div>
          )}

          {pestanaActiva === 'permisos' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sección 2.2: Permisos por Rol</h3>
              {renderizarMatrizPermisos()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CuadroControlRoles;
