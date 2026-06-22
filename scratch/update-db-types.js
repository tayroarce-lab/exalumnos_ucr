const fs = require('fs');

const path = 'src/types/database.types.ts';
let content = fs.readFileSync(path, 'utf16le');

const newFields = `
            proyecto_valor_monto: number | null
            proyecto_valor_moneda: string | null
            proyecto_video_url: string | null
            proyecto_documento_url: string | null`;

const newFieldsOptional = `
            proyecto_valor_monto?: number | null
            proyecto_valor_moneda?: string | null
            proyecto_video_url?: string | null
            proyecto_documento_url?: string | null`;

content = content.replace(
  /proyecto_necesidades: string\[\] \| null/g,
  'proyecto_necesidades: string[] | null' + newFields
);

content = content.replace(
  /proyecto_necesidades\?: string\[\] \| null/g,
  'proyecto_necesidades?: string[] | null' + newFieldsOptional
);

fs.writeFileSync(path, content, 'utf16le');
console.log('Database types updated successfully');
