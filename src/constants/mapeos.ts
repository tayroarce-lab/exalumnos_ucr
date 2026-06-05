export const MAPEO_PROYECTO_TIPO: Record<string, string> = {
  tfg: "Trabajo Final de Graduación",
  tesis: "Tesis",
  practica_dirigida: "Práctica Dirigida",
  seminario: "Seminario",
};

/**
 * Convierte un valor de la base de datos a una etiqueta legible para la UI.
 */
export function tipoProyectoToLabel(dbValue: string | null | undefined): string {
  if (!dbValue) return "";
  return MAPEO_PROYECTO_TIPO[dbValue] || dbValue;
}

/**
 * Convierte una etiqueta legible de la UI a un valor esperado por la base de datos.
 */
export function tipoProyectoToDb(uiLabel: string | null | undefined): string {
  if (!uiLabel) return "";
  const entry = Object.entries(MAPEO_PROYECTO_TIPO).find(([_, label]) => label === uiLabel);
  return entry ? entry[0] : uiLabel;
}
