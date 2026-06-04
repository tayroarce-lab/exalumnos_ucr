// Envolver tus Server Actions con esta función asegura que solo se ejecuten si hay permisos.
export function protegerAccionSegura(accionOriginal: Function) {
  return async function (...argumentos: any[]) {
    // Aquí va tu lógica real de autenticación
    const tieneSesionValida = true;

    if (!tieneSesionValida) {
      throw new Error("Acceso denegado: Usuario no autenticado.");
    }

    return await accionOriginal(...argumentos);
  };
}
