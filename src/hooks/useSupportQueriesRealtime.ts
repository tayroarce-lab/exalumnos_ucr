'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { SupportQuery } from '@/lib/supabase/support'

interface OpcionesRealtime {
  onQueryChange: (query: SupportQuery) => void
}

export function useSupportQueriesRealtime({ onQueryChange }: OpcionesRealtime) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('support-queries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_queries'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            onQueryChange(payload.new as SupportQuery)
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [onQueryChange])
}
