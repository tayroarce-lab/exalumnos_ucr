'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

export async function getOrCreateActiveAiChat() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Attempt to find an existing chat
    const { data: chats, error: chatError } = await supabase
      .from('ai_chats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (chatError) throw chatError

    let chatId: string
    let initialMessages: { id: string, role: string, content: string }[] = []

    if (chats && chats.length > 0) {
      chatId = chats[0].id
      // Fetch messages for this chat
      const { data: messagesData, error: messagesError } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      initialMessages = (messagesData || []).map(msg => ({
        id: msg.id,
        role: msg.sender === 'user' ? 'user' : 'assistant',
        parts: [{ type: 'text', text: msg.text }]
      }))
    } else {
      // Create a new chat
      const { data: newChat, error: newChatError } = await supabase
        .from('ai_chats')
        .insert({ user_id: user.id, title: 'Chat con IA' })
        .select()
        .single()

      if (newChatError) throw newChatError
      chatId = newChat.id
    }

    return { chatId, initialMessages }
  } catch (error) {
    logError('actions/ai-chat/getOrCreateActiveAiChat', error)
    return { chatId: null, initialMessages: [] }
  }
}

export async function getTfgDraft() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { data: tfgDraft, error } = await supabase
      .from('tfg_proposals')
      .select('*')
      .eq('estudiante_id', user.id)
      .eq('is_completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return tfgDraft || null
  } catch (error) {
    logError('actions/ai-chat/getTfgDraft', error)
    return null
  }
}
