"use client";

import { useState } from "react";
import { enviarEnlaceMagico } from "@/actions/authActions";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"estudiante" | "exalumno">("estudiante");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // [VERDE - FUNCION: manejarRegistro]
  // Función que gestiona el clic del botón de registro, validando los datos en el cliente antes de llamar a la acción.
  const manejarRegistro = async () => {
    setMessage(null);
    if (!email.trim()) {
      setMessage({ text: "Por favor, ingresa tu correo electrónico.", type: "error" });
      return;
    }
    
    // Validación estricta del dominio para estudiantes en el cliente
    if (role === "estudiante" && !email.toLowerCase().endsWith("@ucr.ac.cr")) {
      setMessage({ text: "Los estudiantes deben usar su correo institucional (@ucr.ac.cr).", type: "error" });
      return;
    }

    setLoading(true);
    const result = await enviarEnlaceMagico(email, role);
    setLoading(false);

    if (result?.error) {
      setMessage({ text: result.error, type: "error" });
    } else if (result?.success) {
      setMessage({ text: "Enlace mágico enviado. Por favor revisa tu bandeja de entrada para completar el registro.", type: "success" });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl border shadow-sm">
        <h2 className="text-2xl font-bold text-center text-gray-900">Crear Cuenta</h2>
        <p className="text-center text-gray-500">Únete a la plataforma de Exalumnos UCR</p>
        
        <div className="space-y-4 mt-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Usuario</label>
            <div className="flex gap-4">
              <button
                className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${role === "estudiante" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setRole("estudiante")}
              >
                Estudiante
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${role === "exalumno" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setRole("exalumno")}
              >
                Exalumno
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "estudiante" ? "usuario@ucr.ac.cr" : "correo@ejemplo.com"}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
              {message.text}
            </div>
          )}

          <button
            onClick={manejarRegistro}
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Crear Cuenta con Enlace Mágico"}
          </button>
        </div>
      </div>
    </div>
  );
}
