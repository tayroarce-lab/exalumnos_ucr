import React from 'react';

export default function AyudaPage() {
  return (
    <div className="admin-page-container p-8">
      <div className="admin-page-header mb-6">
        <h1 className="admin-page-title text-3xl font-bold">Centro de Ayuda</h1>
        <p className="admin-page-description text-gray-600 mt-2">
          Asistencia técnica y recursos para administradores de la plataforma.
        </p>
      </div>

      <div className="admin-card p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Soporte Técnico</h2>
        <p className="mb-4">
          Si tienes problemas técnicos, dudas sobre la gestión de usuarios, o consultas sobre el funcionamiento del panel, por favor contacta al equipo de soporte de la Fundación Alumni UCR.
        </p>
        <div className="bg-blue-50 p-4 rounded-md text-blue-800">
          <strong>Correo de soporte:</strong> soporte@alumni.ucr.ac.cr<br />
          <strong>Teléfono:</strong> +506 2511-0000 (Ext. Soporte Técnico)
        </div>
      </div>
    </div>
  );
}
