'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CatalogsContextState {
  areasCarreras: Record<string, string[]>
  sedes: string[]
  tiposProyecto: string[]
  tiposApoyo: { id: string; label: string }[]
  isLoading: boolean
  error: string | null
}

const defaultState: CatalogsContextState = {
  areasCarreras: {},
  sedes: [],
  tiposProyecto: [],
  tiposApoyo: [],
  isLoading: true,
  error: null,
}

const CatalogsContext = createContext<CatalogsContextState>(defaultState)

export const useCatalogs = () => useContext(CatalogsContext)

export function CatalogsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CatalogsContextState>(defaultState)

  useEffect(() => {
    async function fetchCatalogs() {
      try {
        const supabase = createClient()

        const [
          { data: areasData },
          { data: carrerasData },
          { data: sedesData },
          { data: proyectosData },
          { data: apoyosData }
        ] = await Promise.all([
          supabase.from('areas').select('*'),
          supabase.from('carreras').select('*'),
          supabase.from('sedes').select('*'),
          supabase.from('tipos_proyecto').select('*'),
          supabase.from('tipos_apoyo').select('*')
        ])

        const areasCarreras: Record<string, string[]> = {}
        if (areasData && carrerasData) {
          areasData.forEach((area) => {
            areasCarreras[area.nombre] = carrerasData
              .filter((c: any) => c.area_id === area.id)
              .map((c: any) => c.nombre)
          })
        }

        const sedes = sedesData ? sedesData.map((s: any) => s.nombre) : []
        const tiposProyecto = proyectosData ? proyectosData.map((p: any) => p.nombre) : []
        const tiposApoyo = apoyosData ? apoyosData.map((a: any) => ({
          id: a.id.toString(),
          label: a.label
        })) : []

        setState({
          areasCarreras,
          sedes,
          tiposProyecto,
          tiposApoyo,
          isLoading: false,
          error: null
        })
      } catch (error: any) {
        setState((prev) => ({ ...prev, isLoading: false, error: error.message || 'Error fetching catalogs' }))
      }
    }

    fetchCatalogs()
  }, [])

  return (
    <CatalogsContext.Provider value={state}>
      {children}
    </CatalogsContext.Provider>
  )
}
