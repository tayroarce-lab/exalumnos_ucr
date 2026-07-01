import { SupabaseClient } from '@supabase/supabase-js'

export interface SupportQuery {
  id: string
  full_name: string
  email: string
  subject: string
  query_type: string
  message: string
  status: 'Pendiente' | 'En proceso' | 'Respondida'
  response?: string | null
  created_at: string
}

export async function insertSupportQuery(
  supabase: SupabaseClient,
  query: Omit<SupportQuery, 'id' | 'status' | 'response' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('support_queries')
    .insert([
      {
        full_name: query.full_name,
        email: query.email,
        subject: query.subject,
        query_type: query.query_type,
        message: query.message,
        status: 'Pendiente'
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data as SupportQuery
}

export async function fetchSupportQueries(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('support_queries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SupportQuery[]
}

export async function updateSupportQuery(
  supabase: SupabaseClient,
  id: string,
  updates: { status: 'Pendiente' | 'En proceso' | 'Respondida'; response?: string | null }
) {
  const { data, error } = await supabase
    .from('support_queries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SupportQuery
}
