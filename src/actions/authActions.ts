"use server";

import { signIn } from "@/auth";

// [VERDE - FUNCION: enviarEnlaceMagico]
// Función encargada de validar el dominio del correo según el rol y despachar el Magic Link a través de Resend.
export async function enviarEnlaceMagico(email: string, role: "estudiante" | "exalumno") {
  // Validar que los estudiantes usen exclusivamente su correo institucional
  if (role === "estudiante" && !email.endsWith("@ucr.ac.cr")) {
    return { error: "Los estudiantes deben usar su correo institucional (@ucr.ac.cr)." };
  }

  try {
    // Despachar el enlace mágico usando el proveedor de Resend de NextAuth.
    // Usamos redirect: false para manejar el estado desde el cliente sin recargar la página.
    await signIn("resend", { email, redirect: false });
    return { success: true };
  } catch (error) {
    // Capturar y manejar errores de envío
    return { error: "Hubo un error al intentar enviar el enlace mágico. Inténtalo de nuevo." };
  }
}

// Acción para iniciar sesión con correo y contraseña
import { iniciarSesion as iniciarSesionSupabase } from "./auth";

export async function iniciarSesion(email: string, password: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const result = await iniciarSesionSupabase({ email, password });
    return result;
  } catch (error: any) {
    return { error: error.message || "Credenciales incorrectas" };
  }
}

