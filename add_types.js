const fs = require('fs');
const file = 'src/types/database.types.ts';
let content = fs.readFileSync(file, 'utf-8');
const types = `      talleres: {
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
      }
`;
content = content.replace('    Tables: {', '    Tables: {\n' + types);
fs.writeFileSync(file, content);
console.log('Types updated.');
