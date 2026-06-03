import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { fetchUserRole } from '@/repositories/admin.repository'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userRole = await fetchUserRole(user.id)
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') || 'matches'

    const adminClient = createAdminClient()

    if (tipo === 'matches') {
      const { data, error } = await adminClient
        .from('matches')
        .select(`
          id,
          tipo_apoyo,
          score_match,
          estado,
          resultado,
          created_at,
          exalumno:users!matches_exalumno_id_fkey(nombre, email),
          estudiante:users!matches_estudiante_id_fkey(nombre, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Construir el CSV
      const headers = ['ID', 'Exalumno Nombre', 'Exalumno Email', 'Estudiante Nombre', 'Estudiante Email', 'Tipo Apoyo', 'Score', 'Estado', 'Resultado', 'Fecha']
      const rows = data.map(match => {
        const exa = match.exalumno as any
        const est = match.estudiante as any
        return [
          match.id,
          `"${exa?.nombre || ''}"`,
          `"${exa?.email || ''}"`,
          `"${est?.nombre || ''}"`,
          `"${est?.email || ''}"`,
          `"${match.tipo_apoyo || ''}"`,
          match.score_match,
          `"${match.estado || ''}"`,
          `"${match.resultado || ''}"`,
          new Date(match.created_at).toLocaleDateString('es-CR')
        ].join(',')
      })

      const csvContent = [headers.join(','), ...rows].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="exportacion_matches.csv"',
        },
      })
    }

    return NextResponse.json({ error: 'Tipo de exportación no soportado' }, { status: 400 })

  } catch (error: any) {
    console.error('Error exportando CSV:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
