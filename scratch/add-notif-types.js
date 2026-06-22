const fs = require('fs');
const path = 'src/types/database.types.ts';
// Trying utf8 first
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('public: {')) {
  // If not utf8, try utf16le
  content = fs.readFileSync(path, 'utf16le');
}

if (!content.includes('notificaciones: {')) {
  const notifType = `
      notificaciones: {
        Row: {
          id: string
          user_id: string
          titulo: string
          mensaje: string
          tipo: string
          link: string | null
          leida: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          mensaje: string
          tipo: string
          link?: string | null
          leida?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          mensaje?: string
          tipo?: string
          link?: string | null
          leida?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }`;
  
  content = content.replace(/tables: \{/, 'tables: {' + notifType);
  // Write back in the same encoding
  fs.writeFileSync(path, content, content.includes('\0') ? 'utf16le' : 'utf8');
  console.log('Added notificaciones to database.types.ts');
} else {
  console.log('notificaciones already exists');
}
