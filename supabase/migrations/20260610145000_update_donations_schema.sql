-- Añadir columna fondo_destino para alinear con la interfaz gráfica de donaciones
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS fondo_destino VARCHAR(50);
