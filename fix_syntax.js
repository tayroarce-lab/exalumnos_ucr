const fs = require('fs');
const files = [
  'src/app/(dashboard)/admin/talleres/page.tsx',
  'src/app/(dashboard)/mis-talleres/[id]/page.tsx',
  'src/app/(dashboard)/mis-talleres/nuevo/page.tsx',
  'src/app/(dashboard)/mis-talleres/page.tsx',
  'src/app/(dashboard)/talleres/[id]/page.tsx',
  'src/app/(dashboard)/talleres/page.tsx',
  'src/types/database.types.ts' // Fix types as well
];

for(const file of files) {
  if (fs.existsSync(file)) {
    let txt = fs.readFileSync(file, 'utf-8');
    txt = txt.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
    fs.writeFileSync(file, txt);
  }
}

// And let's fix database.types.ts properly this time
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

// Remove first injection if it was at auth or graphql
const start = txt.indexOf('      talleres: {');
const end = txt.indexOf('      }', txt.indexOf('talleres_postulaciones: {')) + 7;
if (start !== -1) {
  txt = txt.slice(0, start) + txt.slice(end);
}

// Re-inject at public.Tables
const pubIdx = txt.indexOf('public: {');
if(pubIdx !== -1) {
  const tablesIdx = txt.indexOf('    Tables: {', pubIdx);
  if(tablesIdx !== -1 && txt.indexOf('talleres: {', tablesIdx) === -1) {
    txt = txt.slice(0, tablesIdx + 13) + '\\n' + goodTypes + txt.slice(tablesIdx + 13);
  }
}
fs.writeFileSync('src/types/database.types.ts', txt);

console.log('Fixed syntax and types');
