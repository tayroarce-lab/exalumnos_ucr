const fs = require('fs');
let txt = fs.readFileSync('src/types/database.types.ts', 'utf-8'); 
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
      },
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
      },`;

let start = txt.indexOf('      talleres: {');
if(start !== -1 && start < 500) {
  let end = txt.indexOf('      }', txt.indexOf('talleres_postulaciones: {', start)) + 7;
  if(txt[end] === ',') end++;
  txt = txt.slice(0, start) + txt.slice(end);
}

const pubIdx = txt.indexOf('  public: {');
if(pubIdx !== -1) {
  const tablesIdx = txt.indexOf('Tables: {', pubIdx);
  if (tablesIdx !== -1) {
    const injectPos = tablesIdx + 'Tables: {'.length;
    if(txt.indexOf('talleres: {', pubIdx) === -1) {
      txt = txt.slice(0, injectPos) + '\n' + goodTypes + txt.slice(injectPos);
      fs.writeFileSync('src/types/database.types.ts', txt);
      console.log('Fixed correctly at public: {} !');
    } else {
      console.log('Already there');
    }
  }
}
