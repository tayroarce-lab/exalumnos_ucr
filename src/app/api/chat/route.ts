import { createClient } from '@/lib/supabase/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

// Extracts plain text from a UIMessage (new parts format) or legacy (content string)
function extractText(msg: any): string {
  if (typeof msg.content === 'string') return msg.content;
  if (Array.isArray(msg.parts)) {
    return msg.parts.map((p: any) => p.text ?? '').join('');
  }
  return '';
}

// Converts UIMessage[] to the simple {role, content} format that streamText accepts
function toModelMessages(messages: any[]) {
  return messages
    .filter((m: any) => m.role === 'user' || m.role === 'assistant')
    .map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: extractText(m),
    }))
    .filter((m) => m.content.length > 0);
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { messages, chatId } = body;

    console.log('[api/chat] chatId:', chatId);
    console.log('[api/chat] messages count:', messages?.length);

    if (!chatId) {
       return new NextResponse('Missing chatId', { status: 400 });
    }

    // Get latest user message to save
    const latestMessage = messages?.[messages.length - 1];
    if (latestMessage?.role === 'user') {
        const messageText = extractText(latestMessage);
        console.log('[api/chat] saving user message:', messageText);
        if (messageText) {
          await supabase.from('ai_messages').insert({
              chat_id: chatId,
              sender: 'user',
              text: messageText
          });
        }
    }

    // Fetch user context for the prompt
    const { data: profile } = await supabase
      .from('estudiantes')
      .select('*, perfiles(*)')
      .eq('id', user.id)
      .single();

    const systemPrompt = `Eres un asistente virtual de orientación profesional para estudiantes y exalumnos de la Universidad de Costa Rica.
Eres empático, directo y experto en desarrollo profesional, entrevistas, CVs y búsqueda de empleo.
Responde de forma concisa. Usa formato markdown.
Contexto del usuario actual:
Nombre: ${profile?.perfiles?.nombre ?? ''} ${profile?.perfiles?.apellidos ?? ''}
Carrera ID (si existe): ${profile?.carrera_id ?? 'No disponible'}
Busca Pasantía: ${profile?.busca_pasantia ? 'Sí' : 'No'}
Busca Empleo: ${profile?.busca_empleo ? 'Sí' : 'No'}
Busca Mentor: ${profile?.busca_mentor ? 'Sí' : 'No'}
`;

    const modelMessages = toModelMessages(messages);
    console.log('[api/chat] modelMessages:', JSON.stringify(modelMessages));

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: modelMessages,
      onFinish: async ({ text }) => {
        if (text) {
          try {
            await supabase.from('ai_messages').insert({
              chat_id: chatId,
              sender: 'ai',
              text: text
            });
          } catch (e) {
            logError('api/chat/onFinish', e);
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('[api/chat] CAUGHT ERROR:', error?.message ?? error, error?.stack);
    logError('api/chat/route.ts/POST', error);
    return new NextResponse(
      JSON.stringify({ error: error?.message ?? 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
