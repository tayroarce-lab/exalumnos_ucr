-- =============================================================================
-- MIGRACIÓN 11: Implementar Módulo de Donaciones (RF-07)
-- Descripción : Limpiar tablas anteriores de donaciones e implementar
--               el esquema solicitado.
-- =============================================================================

-- 1. Eliminar tablas conflictivas anteriores
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.donaciones CASCADE;

-- 2. Crear la nueva tabla donaciones
CREATE TABLE IF NOT EXISTS public.donaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumni_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  proyecto_destino TEXT NOT NULL DEFAULT 'Fondo general',
  monto NUMERIC NOT NULL,
  moneda TEXT NOT NULL CHECK (moneda IN ('CRC', 'USD')),
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('SINPE', 'Transferencia')),
  fecha_transferencia TIMESTAMP WITH TIME ZONE NOT NULL,
  numero_referencia TEXT,
  comprobante_url TEXT NOT NULL,
  mensaje_estudiante TEXT CHECK (char_length(mensaje_estudiante) <= 300),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'rechazada')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE public.donaciones ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad (RLS)
-- Alumni can only see their own donations
CREATE POLICY "Alumni can view own donations" ON public.donaciones
  FOR SELECT USING (auth.uid() = alumni_id);

-- Alumni can insert their own donations
CREATE POLICY "Alumni can insert donations" ON public.donaciones
  FOR INSERT WITH CHECK (auth.uid() = alumni_id);

-- Admin ve y actualiza todas las donaciones
CREATE POLICY "Admin ve todas las donaciones" ON public.donaciones
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin'));

CREATE POLICY "Admin actualiza donaciones" ON public.donaciones
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin'));

-- 5. Configurar Storage para comprobantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Admin ve todos los comprobantes" ON storage.objects
  FOR SELECT USING (bucket_id = 'comprobantes' AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin'
  ));

CREATE POLICY "Exalumno ve sus comprobantes" ON storage.objects
  FOR SELECT USING (bucket_id = 'comprobantes' AND auth.uid()::text = (string_to_array(name, '/'))[1]);

CREATE POLICY "Exalumno sube comprobantes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'comprobantes' AND auth.uid()::text = (string_to_array(name, '/'))[1]);

-- 6. Agregar columnas a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS donacion_monto_max NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS donacion_moneda TEXT;
