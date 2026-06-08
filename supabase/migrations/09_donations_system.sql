-- =============================================================================
-- MIGRACIÓN 09: Sistema de Donaciones (SINPE e IBAN)
-- Descripción : Crea la tabla donations, ENUM de estados, políticas de
--               privacidad RLS y el bucket de almacenamiento seguro.
-- Autor       : Sistema de Gestión Alumni UCR
-- =============================================================================

-- [VERDE - FUNCION: crear_enum_estado_donacion]
DO $$ BEGIN
  CREATE TYPE public.estado_donacion AS ENUM ('pendiente', 'confirmada', 'rechazada');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.estado_donacion IS 'Estados del ciclo de vida de una donación.';

-- [VERDE - FUNCION: crear_tabla_donations]
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    proyecto_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL, -- Asumiendo proyecto atado al user_id
    fondo_general BOOLEAN NOT NULL DEFAULT false,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    moneda VARCHAR(3) NOT NULL CHECK (moneda IN ('CRC', 'USD')),
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('SINPE', 'Transferencia')),
    fecha_transferencia TIMESTAMPTZ NOT NULL,
    numero_referencia VARCHAR(100),
    comprobante_url TEXT NOT NULL,
    mensaje_estudiante VARCHAR(300),
    estado public.estado_donacion NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.donations IS 'Registro de donaciones realizadas por exalumnos.';

-- [VERDE - FUNCION: activar_rls_donations]
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Política: Exalumno ve solo sus donaciones
CREATE POLICY "Exalumno ve solo sus donaciones"
    ON public.donations FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Exalumno puede crear sus donaciones
CREATE POLICY "Exalumno puede crear donaciones"
    ON public.donations FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND tipo = 'exalumno'
        )
    );

-- Política: Admin ve todo
CREATE POLICY "Admin ve todas las donaciones"
    ON public.donations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND tipo = 'admin'
        )
    );

-- Política: Admin actualiza estado
CREATE POLICY "Admin puede actualizar donaciones"
    ON public.donations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND tipo = 'admin'
        )
    );

-- [VERDE - FUNCION: crear_bucket_comprobantes]
-- Crear el bucket de almacenamiento para los comprobantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Admin ve todos los comprobantes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin'
    ));

CREATE POLICY "Exalumno ve sus comprobantes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts' AND auth.uid()::text = (string_to_array(name, '/'))[1]);

CREATE POLICY "Exalumno sube comprobantes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (string_to_array(name, '/'))[1]);
