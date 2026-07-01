const fs = require('fs');

const goodTypes = `      talleres: {
        Row: {
          id: string
          exalumno_id: string
          titulo: string
          descripcion: string
          fecha_taller: string
          modalidad: 'ONLINE' | 'PRESENCIAL' | 'HIBRIDO'
          estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
          ubicacion_url: string | null
          cupos: number | null
          multimedia_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exalumno_id: string
          titulo: string
          descripcion: string
          fecha_taller: string
          modalidad: 'ONLINE' | 'PRESENCIAL' | 'HIBRIDO'
          estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
          ubicacion_url?: string | null
          cupos?: number | null
          multimedia_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exalumno_id?: string
          titulo?: string
          descripcion?: string
          fecha_taller?: string
          modalidad?: 'ONLINE' | 'PRESENCIAL' | 'HIBRIDO'
          estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
          ubicacion_url?: string | null
          cupos?: number | null
          multimedia_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talleres_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      talleres_postulaciones: {
        Row: {
          id: string
          taller_id: string
          estudiante_id: string
          estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'
          mensaje: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          taller_id: string
          estudiante_id: string
          estado?: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'
          mensaje?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          taller_id?: string
          estudiante_id?: string
          estado?: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'
          mensaje?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talleres_postulaciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talleres_postulaciones_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "talleres"
            referencedColumns: ["id"]
          }
        ]
      }`;

let txt = fs.readFileSync('src/types/database.types.ts', 'utf-8');

const targetStr = `  public: {
    Tables: {`;
const idx = txt.indexOf(targetStr);
if (idx !== -1) {
  if (txt.indexOf('talleres: {', idx) === -1) {
    const insertPos = idx + targetStr.length;
    txt = txt.slice(0, insertPos) + '\n' + goodTypes + ',' + txt.slice(insertPos);
    fs.writeFileSync('src/types/database.types.ts', txt);
    console.log('Fixed correctly');
  } else {
    console.log('Already fixed');
  }
} else {
  console.log('Target string not found');
}
