const fs = require('fs');
const path = 'src/types/database.types.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('public: {')) {
  content = fs.readFileSync(path, 'utf16le');
}

if (!content.includes('reportes_perfiles: {')) {
  const reportType = `
      reportes_perfiles: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          motivo: string
          estado: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          motivo: string
          estado?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          motivo?: string
          estado?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reportes_perfiles_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_perfiles_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }`;
  
  content = content.replace(/tables: \{/, 'tables: {' + reportType);
  fs.writeFileSync(path, content, content.includes('\0') ? 'utf16le' : 'utf8');
  console.log('Added reportes_perfiles to database.types.ts');
} else {
  console.log('reportes_perfiles already exists');
}
