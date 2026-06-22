-- =============================================================================
-- MIGRACIÓN: Creación del esquema para el módulo ChatOctavio
-- Descripción: Creación de tablas, RLS y habilitación de tiempo real para
--              chats privados entre estudiantes y exalumnos.
-- Ubicación: supabase/migrations/20260622120000_create_chatoctavio_schema.sql
-- =============================================================================

-- 1. Tabla de solicitudes para estudiantes
CREATE TABLE IF NOT EXISTS public.chatoctavio_solicitudes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  estado      text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  CONSTRAINT chatoctavio_solicitud_unique UNIQUE (sender_id, receiver_id),
  CONSTRAINT chatoctavio_solicitud_no_self CHECK (sender_id <> receiver_id)
);

-- 2. Tabla de conversaciones
CREATE TABLE IF NOT EXISTS public.chatoctavio_conversaciones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        text NOT NULL CHECK (tipo IN ('estudiante_estudiante', 'exalumno_estudiante')),
  user1_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  CONSTRAINT chatoctavio_unique_pair UNIQUE (user1_id, user2_id),
  CONSTRAINT chatoctavio_id_order CHECK (user1_id < user2_id)
);

-- 3. Tabla de mensajes
CREATE TABLE IF NOT EXISTS public.chatoctavio_mensajes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chatoctavio_conversaciones(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contenido       text NOT NULL,
  created_at      timestamptz DEFAULT now(),
  leido           boolean DEFAULT false
);

-- Habilitar seguridad de nivel de fila (Row Level Security - RLS)
ALTER TABLE public.chatoctavio_solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatoctavio_conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatoctavio_mensajes ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS: chatoctavio_solicitudes
CREATE POLICY "select_solicitudes_participantes" ON public.chatoctavio_solicitudes
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "insert_solicitudes_estudiantes" ON public.chatoctavio_solicitudes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (SELECT 1 FROM public.users WHERE id = sender_id AND rol = 'estudiante')
    AND EXISTS (SELECT 1 FROM public.users WHERE id = receiver_id AND rol = 'estudiante')
  );

CREATE POLICY "update_solicitudes_destinatario" ON public.chatoctavio_solicitudes
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "delete_solicitudes_participantes" ON public.chatoctavio_solicitudes
  FOR DELETE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 5. Políticas RLS: chatoctavio_conversaciones
CREATE POLICY "select_conversaciones_participantes" ON public.chatoctavio_conversaciones
  FOR SELECT TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "insert_conversaciones_validas" ON public.chatoctavio_conversaciones
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = user1_id OR auth.uid() = user2_id)
    AND (
      (tipo = 'estudiante_estudiante' AND EXISTS (
        SELECT 1 FROM public.chatoctavio_solicitudes s
        WHERE ((s.sender_id = user1_id AND s.receiver_id = user2_id) OR (s.sender_id = user2_id AND s.receiver_id = user1_id))
          AND s.estado = 'aceptada'
      ))
      OR
      (tipo = 'exalumno_estudiante' AND EXISTS (
        SELECT 1 FROM public.matches m
        WHERE ((m.exalumno_id = user1_id AND m.estudiante_id = user2_id) OR (m.exalumno_id = user2_id AND m.estudiante_id = user1_id))
          AND m.estado = 'activo'
      ))
    )
  );

-- 6. Políticas RLS: chatoctavio_mensajes
CREATE POLICY "select_mensajes_participantes" ON public.chatoctavio_mensajes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chatoctavio_conversaciones c
      WHERE c.id = conversation_id AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
    )
  );

CREATE POLICY "insert_mensajes_autor" ON public.chatoctavio_mensajes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chatoctavio_conversaciones c
      WHERE c.id = conversation_id AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
    )
  );

CREATE POLICY "update_mensajes_participantes" ON public.chatoctavio_mensajes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chatoctavio_conversaciones c
      WHERE c.id = conversation_id AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
    )
  );

-- 7. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_chatoctavio_solicitudes_sender ON public.chatoctavio_solicitudes(sender_id);
CREATE INDEX IF NOT EXISTS idx_chatoctavio_solicitudes_receiver ON public.chatoctavio_solicitudes(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chatoctavio_solicitudes_estado ON public.chatoctavio_solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_chatoctavio_conversaciones_u1 ON public.chatoctavio_conversaciones(user1_id);
CREATE INDEX IF NOT EXISTS idx_chatoctavio_conversaciones_u2 ON public.chatoctavio_conversaciones(user2_id);
CREATE INDEX IF NOT EXISTS idx_chatoctavio_mensajes_conv ON public.chatoctavio_mensajes(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatoctavio_mensajes_created ON public.chatoctavio_mensajes(created_at);

-- 8. Habilitar tiempo real (Realtime) para las tablas de chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatoctavio_conversaciones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatoctavio_mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatoctavio_solicitudes;
