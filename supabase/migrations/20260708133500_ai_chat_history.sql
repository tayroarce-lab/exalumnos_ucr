-- Tabla para agrupar sesiones de chat
CREATE TABLE public.ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar los mensajes del chat
CREATE TABLE public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.ai_chats(id) ON DELETE CASCADE,
    sender TEXT CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_chats
CREATE POLICY "Usuarios pueden ver sus propios chats" 
    ON public.ai_chats FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Usuarios pueden insertar sus propios chats" 
    ON public.ai_chats FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Usuarios pueden actualizar sus propios chats" 
    ON public.ai_chats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios chats" 
    ON public.ai_chats FOR DELETE USING (auth.uid() = user_id);

-- Políticas para ai_messages
CREATE POLICY "Usuarios pueden ver mensajes de sus chats" 
    ON public.ai_messages FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.ai_chats WHERE id = ai_messages.chat_id AND user_id = auth.uid()));

CREATE POLICY "Usuarios pueden insertar mensajes en sus chats" 
    ON public.ai_messages FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.ai_chats WHERE id = ai_messages.chat_id AND user_id = auth.uid()));
