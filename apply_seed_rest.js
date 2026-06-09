const https = require('https');

const PROJECT_URL = 'vzcjppbvmbhcnrempuxf.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2pwcGJ2bWJoY25yZW1wdXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxMDY5MCwiZXhwIjoyMDk1OTg2NjkwfQ.tMYXuDqriSrhR2jllBL-nz9gNo66ORTOVWPsAL6GFLE';

const HEADERS = {
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey':        SERVICE_KEY,
  'Content-Type':  'application/json',
  'Prefer':        'resolution=merge-duplicates,return=minimal',
};

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: PROJECT_URL,
      path,
      method,
      headers: {
        ...HEADERS,
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };

    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode} on ${method} ${path}: ${data.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function upsert(table, rows) {
  if (!rows || rows.length === 0) return;
  const allKeys = new Set();
  rows.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)));
  const normalizedRows = rows.map(r => {
    const nr = { ...r };
    allKeys.forEach(k => {
      if (nr[k] === undefined) nr[k] = null;
    });
    return nr;
  });
  await request('POST', `/rest/v1/${table}`, normalizedRows);
  console.log(`   ✅  ${table} → ${normalizedRows.length} fila(s)`);
}

async function getIds(table, field, values) {
  const filter = values.map(v => encodeURIComponent(v)).join(',');
  const res = await request('GET', `/rest/v1/${table}?select=id,${field}&${field}=in.(${filter})`);
  const rows = JSON.parse(res.body);
  return Object.fromEntries(rows.map(r => [r[field], r.id]));
}

async function main() {
  console.log('\n🚀  Aplicando seed via PostgREST → vzcjppbvmbhcnrempuxf\n');

  console.log('📂  Bloque 1 — Catálogos');
  await upsert('industry_sectors', [
    { id: 'tecnologia_ti',           name: 'Tecnología, Software y TI' },
    { id: 'finanzas_banca',          name: 'Finanzas, Banca y Seguros' },
    { id: 'salud_medicina',          name: 'Salud, Médica y Farmacéutica' },
    { id: 'ingenieria_construccion', name: 'Ingeniería, Construcción y Arquitectura' },
    { id: 'educacion_academia',      name: 'Educación y Academia' },
    { id: 'manufactura_industria',   name: 'Manufactura y Producción' },
    { id: 'logistica_transporte',    name: 'Logística, Transporte y Distribución' },
    { id: 'turismo_hospitalidad',    name: 'Turismo, Hotelería y Gastronomía' },
    { id: 'agro_alimentos',          name: 'Agropecuario y Alimentos' },
    { id: 'comercio_retail',         name: 'Comercio, Ventas y Retail' },
    { id: 'gobierno_publico',        name: 'Gobierno y Sector Público' },
    { id: 'servicios_profesionales', name: 'Consultoría y Servicios Profesionales' },
    { id: 'dispositivos_medicos',    name: 'Dispositivos Médicos y MedTech' },
    { id: 'energia_utilities',       name: 'Energía y Servicios Públicos' },
    { id: 'investigacion_ciencia',   name: 'Investigación y Ciencia Aplicada' },
  ]);

  console.log('\n📂  Bloque 2 — Usuarios (public.users)');
  const users = [
    // Admins
    { id: 'aa000001-0000-0000-0000-000000000001', email: 'admin.principal@fundacionucr.ac.cr',
      nombre: 'Mariela', apellidos: 'Vargas Mora', rol: 'admin',
      email_verified: true, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: false, visible_en_directorio: false, reportes_recibidos: 0 },
    { id: 'aa000002-0000-0000-0000-000000000002', email: 'admin.sistemas@fundacionucr.ac.cr',
      nombre: 'Diego', apellidos: 'Solano Ureña', rol: 'admin',
      email_verified: true, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: false, visible_en_directorio: false, reportes_recibidos: 0 },
    // Exalumnos
    { id: 'e1000001-0000-0000-0000-000000000001', email: 'andres.quesada@intel.com',
      nombre: 'Andrés', apellidos: 'Quesada Picado', rol: 'exalumno',
      email_verified: true, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: true, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/andres_quesada.jpg' },
    { id: 'e1000002-0000-0000-0000-000000000002', email: 'valeria.mora@mckinsey.com',
      nombre: 'Valeria', apellidos: 'Mora Cascante', rol: 'exalumno',
      email_verified: true, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: true, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/valeria_mora.jpg' },
    { id: 'e1000003-0000-0000-0000-000000000003', email: 'rodrigo.arias@bostonsci.com',
      nombre: 'Rodrigo', apellidos: 'Arias Fonseca', rol: 'exalumno',
      email_verified: true, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: true, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/rodrigo_arias.jpg' },
    { id: 'e1000004-0000-0000-0000-000000000004', email: 'carolina.jimenez@grupoice.com',
      nombre: 'Carolina', apellidos: 'Jiménez Brenes', rol: 'exalumno',
      email_verified: true, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: false, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/carolina_jimenez.jpg' },
    { id: 'e1000005-0000-0000-0000-000000000005', email: 'pablo.saenz@amazon.com',
      nombre: 'Pablo', apellidos: 'Sáenz Víquez', rol: 'exalumno',
      email_verified: true, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: true, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/pablo_saenz.jpg' },
    { id: 'e1000006-0000-0000-0000-000000000006', email: 'natalia.brenes@bac.cr',
      nombre: 'Natalia', apellidos: 'Brenes Rodríguez', rol: 'exalumno',
      email_verified: true, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: true, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/natalia_brenes.jpg' },
    // Estudiantes (5 perfil completo)
    { id: '52000001-0000-0000-0000-000000000001', email: 'ana.guerrero@ucr.ac.cr',
      nombre: 'Ana', apellidos: 'Guerrero Solís', rol: 'estudiante',
      email_verified: true, activo: true, busca_mentoria: true, busca_empleo: false,
      ofrece_mentoria: false, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/ana_guerrero.jpg' },
    { id: '52000002-0000-0000-0000-000000000002', email: 'marco.artavia@ucr.ac.cr',
      nombre: 'Marco', apellidos: 'Artavia Badilla', rol: 'estudiante',
      email_verified: true, activo: true, busca_mentoria: true, busca_empleo: true,
      ofrece_mentoria: false, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/marco_artavia.jpg' },
    { id: '52000003-0000-0000-0000-000000000003', email: 'sofia.campos@ucr.ac.cr',
      nombre: 'Sofía', apellidos: 'Campos Arroyo', rol: 'estudiante',
      email_verified: true, activo: true, busca_mentoria: false, busca_empleo: true,
      ofrece_mentoria: false, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/sofia_campos.jpg' },
    { id: '52000004-0000-0000-0000-000000000004', email: 'daniel.rojas@ucr.ac.cr',
      nombre: 'Daniel', apellidos: 'Rojas Monge', rol: 'estudiante',
      email_verified: true, activo: true, busca_mentoria: true, busca_empleo: true,
      ofrece_mentoria: false, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/daniel_rojas.jpg' },
    { id: '52000005-0000-0000-0000-000000000005', email: 'valentina.pizarro@ucr.ac.cr',
      nombre: 'Valentina', apellidos: 'Pizarro Matarrita', rol: 'estudiante',
      email_verified: true, activo: true, busca_mentoria: true, busca_empleo: false,
      ofrece_mentoria: false, visible_en_directorio: true, reportes_recibidos: 0,
      foto_url: 'https://storage.fundacionucr.ac.cr/avatars/valentina_pizarro.jpg' },
    // Estudiantes perfil incompleto
    { id: '52000006-0000-0000-0000-000000000006', email: 'carlos.mejia@ucr.ac.cr',
      nombre: 'Carlos', apellidos: 'Mejía Herrera', rol: 'estudiante',
      email_verified: false, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: false, visible_en_directorio: false, reportes_recibidos: 0 },
    { id: '52000007-0000-0000-0000-000000000007', email: 'lucia.vindas@ucr.ac.cr',
      nombre: 'Lucía', apellidos: 'Vindas Alpízar', rol: 'estudiante',
      email_verified: false, activo: true, busca_mentoria: false, busca_empleo: false,
      ofrece_mentoria: false, visible_en_directorio: false, reportes_recibidos: 0 },
  ];
  await upsert('users', users);

  console.log('\n📂  Bloque 3 — Resolviendo IDs carrera↔campus...');
  const carrerasMap = await getIds('carreras', 'nombre', [
    'Ciencias de la Computación e Informática', 'Economía', 'Ingeniería Eléctrica',
    'Dirección de Empresas', 'Psicología', 'Ingeniería Industrial', 'Ingeniería Civil',
    'Contaduría Pública', 'Administración Pública', 'Derecho',
    'Comunicación Colectiva', 'Medicina y Cirugía', 'Microbiología y Química Clínica',
    'Biología', 'Química', 'Matemática', 'Informática Empresarial', 'Trabajo Social',
    'Sociología', 'Agronomía',
  ]);
  const campusMap = await getIds('campus', 'nombre', [
    'Rodrigo Facio', 'Occidente', 'Atlántico', 'Guanacaste', 'Pacífico',
  ]);

  const ccRes  = await request('GET', '/rest/v1/carrera_campus?select=id,carrera_id,campus_id');
  const ccRows = JSON.parse(ccRes.body);

  function findCC(carreraNombre, campusNombre) {
    const cid = carrerasMap[carreraNombre];
    const kid = campusMap[campusNombre];
    if (!cid || !kid) return null;
    return ccRows.find(r => r.carrera_id === cid && r.campus_id === kid)?.id ?? null;
  }

  console.log('\n📂  Bloque 4 — users_carreras');
  const userCarrerasData = [
    { user_id: 'e1000001-0000-0000-0000-000000000001', carrera: 'Ciencias de la Computación e Informática', campus: 'Rodrigo Facio', anio_ingreso: 2005, anio_graduacion: 2010 },
    { user_id: 'e1000002-0000-0000-0000-000000000002', carrera: 'Economía',                                 campus: 'Rodrigo Facio', anio_ingreso: 2003, anio_graduacion: 2008 },
    { user_id: 'e1000003-0000-0000-0000-000000000003', carrera: 'Ingeniería Eléctrica',                     campus: 'Rodrigo Facio', anio_ingreso: 2004, anio_graduacion: 2009 },
    { user_id: 'e1000004-0000-0000-0000-000000000004', carrera: 'Ciencias de la Computación e Informática', campus: 'Rodrigo Facio', anio_ingreso: 2008, anio_graduacion: 2013 },
    { user_id: 'e1000005-0000-0000-0000-000000000005', carrera: 'Ciencias de la Computación e Informática', campus: 'Rodrigo Facio', anio_ingreso: 2010, anio_graduacion: 2015 },
    { user_id: 'e1000006-0000-0000-0000-000000000006', carrera: 'Dirección de Empresas',                   campus: 'Rodrigo Facio', anio_ingreso: 2009, anio_graduacion: 2014 },
    { user_id: '52000001-0000-0000-0000-000000000001', carrera: 'Ciencias de la Computación e Informática', campus: 'Rodrigo Facio', anio_ingreso: 2022, anio_graduacion: null },
    { user_id: '52000002-0000-0000-0000-000000000002', carrera: 'Ciencias de la Computación e Informática', campus: 'Rodrigo Facio', anio_ingreso: 2021, anio_graduacion: null },
    { user_id: '52000003-0000-0000-0000-000000000003', carrera: 'Dirección de Empresas',                   campus: 'Rodrigo Facio', anio_ingreso: 2023, anio_graduacion: null },
    { user_id: '52000004-0000-0000-0000-000000000004', carrera: 'Ingeniería Eléctrica',                    campus: 'Rodrigo Facio', anio_ingreso: 2020, anio_graduacion: null },
    { user_id: '52000005-0000-0000-0000-000000000005', carrera: 'Psicología',                              campus: 'Rodrigo Facio', anio_ingreso: 2022, anio_graduacion: null },
  ];

  const userCarrerasRows = userCarrerasData
    .map(r => {
      const cc_id = findCC(r.carrera, r.campus);
      if (!cc_id) return null;
      const row = { user_id: r.user_id, carrera_campus_id: cc_id, anio_ingreso: r.anio_ingreso };
      if (r.anio_graduacion) row.anio_graduacion = r.anio_graduacion;
      return row;
    })
    .filter(Boolean);

  await upsert('users_carreras', userCarrerasRows);

  console.log('\n📂  Bloque 5 — experiencia_laboral');
  await upsert('experiencia_laboral', [
    { id: 'e1a00001-0000-0000-0000-000000000001', user_id: 'e1000001-0000-0000-0000-000000000001', empresa: 'Intel Costa Rica', puesto: 'Senior Software Engineer', fecha_inicio: '2010-08-01', actualmente_aqui: true, descripcion: 'Desarrollo de firmware para procesadores de bajo consumo. Liderazgo de equipo de 8 ingenieros en proyecto RISC-V.' },
    { id: 'e1a00001-0000-0000-0000-000000000002', user_id: 'e1000001-0000-0000-0000-000000000001', empresa: 'Ministerio de Ciencia y Tecnología', puesto: 'Consultor TI', fecha_inicio: '2008-06-01', fecha_fin: '2010-07-31', actualmente_aqui: false, descripcion: 'Auditoría y modernización de infraestructura tecnológica gubernamental.' },
    { id: 'e1a00002-0000-0000-0000-000000000001', user_id: 'e1000002-0000-0000-0000-000000000002', empresa: 'McKinsey & Company', puesto: 'Associate – Financial Services', fecha_inicio: '2010-02-01', actualmente_aqui: true, descripcion: 'Proyectos de transformación digital para banca centroamericana.' },
    { id: 'e1a00002-0000-0000-0000-000000000002', user_id: 'e1000002-0000-0000-0000-000000000002', empresa: 'Banco Nacional de Costa Rica', puesto: 'Analista Económico', fecha_inicio: '2008-01-01', fecha_fin: '2010-01-31', actualmente_aqui: false, descripcion: 'Modelado macroeconómico y análisis de riesgo soberano.' },
    { id: 'e1a00003-0000-0000-0000-000000000001', user_id: 'e1000003-0000-0000-0000-000000000003', empresa: 'Boston Scientific Costa Rica', puesto: 'Manufacturing Engineer III', fecha_inicio: '2012-03-01', actualmente_aqui: true, descripcion: 'Diseño y validación de sistemas de control para dispositivos de estimulación cardíaca. Cumplimiento ISO 13485.' },
    { id: 'e1a00004-0000-0000-0000-000000000001', user_id: 'e1000004-0000-0000-0000-000000000004', empresa: 'Instituto Costarricense de Electricidad (ICE)', puesto: 'Arquitecta de Soluciones Cloud', fecha_inicio: '2014-01-01', actualmente_aqui: true, descripcion: 'Migración de sistemas críticos de telecomunicaciones a arquitectura multi-cloud.' },
    { id: 'e1a00005-0000-0000-0000-000000000001', user_id: 'e1000005-0000-0000-0000-000000000005', empresa: 'Amazon Web Services', puesto: 'Solutions Architect', fecha_inicio: '2016-07-01', actualmente_aqui: true, descripcion: 'Arquitectura de soluciones para clientes enterprise de LATAM. Especialización en serverless y machine learning.' },
    { id: 'e1a00006-0000-0000-0000-000000000001', user_id: 'e1000006-0000-0000-0000-000000000006', empresa: 'BAC Credomatic', puesto: 'Gerente de Estrategia Corporativa', fecha_inicio: '2015-04-01', actualmente_aqui: true, descripcion: 'Planificación estratégica y transformación digital en 6 países de Centroamérica.' },
    { id: 'e1a00007-0000-0000-0000-000000000001', user_id: '52000001-0000-0000-0000-000000000001', empresa: 'CITIC UCR', puesto: 'Asistente de Investigación', fecha_inicio: '2023-02-01', actualmente_aqui: true, descripcion: 'Colaboración en proyecto de IA aplicada a diagnóstico médico con imágenes.' },
    { id: 'e1a00007-0000-0000-0000-000000000002', user_id: '52000002-0000-0000-0000-000000000002', empresa: 'Ministerio de Hacienda', puesto: 'Practicante — Área de TI', fecha_inicio: '2023-06-01', fecha_fin: '2023-11-30', actualmente_aqui: false, descripcion: 'Soporte al módulo de facturación electrónica del SIGAF.' },
  ]);

  console.log('\n📂  Bloque 6 — curriculums');
  await upsert('curriculums', [
    { id: 'c1000001-0000-0000-0000-000000000001', user_id: '52000001-0000-0000-0000-000000000001', sobre_mi: 'Estudiante...', url_linkedin: 'https://linkedin.com/in/ana-guerrero-cr', habilidades_tecnicas: { Python: 'Avanzado' } },
    { id: 'c1000002-0000-0000-0000-000000000002', user_id: '52000002-0000-0000-0000-000000000002', sobre_mi: 'Desarrollador...', url_linkedin: 'https://linkedin.com/in/marco-artavia-ucr', habilidades_tecnicas: { Java: 'Avanzado' } },
    { id: 'c1000003-0000-0000-0000-000000000003', user_id: '52000003-0000-0000-0000-000000000003', sobre_mi: 'Estudiante finanzas...', url_linkedin: 'https://linkedin.com/in/sofia-campos-cr', habilidades_tecnicas: { Excel: 'Avanzado' } },
    { id: 'c1000004-0000-0000-0000-000000000004', user_id: '52000004-0000-0000-0000-000000000004', sobre_mi: 'Estudiante IE...', url_linkedin: 'https://linkedin.com/in/daniel-rojas-ie', habilidades_tecnicas: { MATLAB: 'Avanzado' } },
    { id: 'c1000005-0000-0000-0000-000000000005', user_id: '52000005-0000-0000-0000-000000000005', sobre_mi: 'Psicóloga...', url_linkedin: 'https://linkedin.com/in/valentina-pizarro-psi', habilidades_tecnicas: { SPSS: 'Avanzado' } },
    { id: 'c1000006-0000-0000-0000-000000000006', user_id: 'e1000001-0000-0000-0000-000000000001', sobre_mi: 'Senior SWE...', url_linkedin: 'https://linkedin.com/in/andres-quesada-intel', habilidades_tecnicas: { 'C/C++': 'Experto' } },
    { id: 'c1000007-0000-0000-0000-000000000007', user_id: 'e1000006-0000-0000-0000-000000000006', sobre_mi: 'Gerente estrategia...', url_linkedin: 'https://linkedin.com/in/natalia-brenes-bac', habilidades_tecnicas: { Tableau: 'Avanzado' } },
  ]);

  console.log('\n📂  Bloque 7 — curriculum_certificaciones');
  await upsert('curriculum_certificaciones', [
    { id: 'ce470001-0000-0000-0000-000000000001', curriculum_id: 'c1000001-0000-0000-0000-000000000001', nombre: 'TensorFlow Developer Certificate', institucion: 'Google', fecha: '2024-03-15', url_verificacion: 'https://www.credential.net/abc123', orden: 1 },
    { id: 'ce470001-0000-0000-0000-000000000002', curriculum_id: 'c1000001-0000-0000-0000-000000000001', nombre: 'Python for Data Science and AI', institucion: 'IBM / Coursera', fecha: '2023-08-20', url_verificacion: 'https://coursera.org/verify/def456', orden: 2 },
    { id: 'ce470002-0000-0000-0000-000000000001', curriculum_id: 'c1000002-0000-0000-0000-000000000002', nombre: 'Certified Ethical Hacker (CEH)', institucion: 'EC-Council', fecha: '2024-01-10', url_verificacion: 'https://aspen.eccouncil.org/verify/ghi789', orden: 1 },
    { id: 'ce470002-0000-0000-0000-000000000002', curriculum_id: 'c1000002-0000-0000-0000-000000000002', nombre: 'AWS Certified Cloud Practitioner', institucion: 'Amazon Web Services', fecha: '2023-11-05', url_verificacion: 'https://aws.amazon.com/verification/jkl012', orden: 2 },
  ]);

  console.log('\n📂  Bloque 8 — posiciones');
  await upsert('posiciones', [
    { id: '60000001-0000-0000-0000-000000000001', exalumno_id: 'e1000001-0000-0000-0000-000000000001', estado: 'activa', empresa: 'Intel', descripcion_general: 'Pasantía en Arquitectura de Firmware RISC-V' },
    { id: '60000002-0000-0000-0000-000000000002', exalumno_id: 'e1000002-0000-0000-0000-000000000002', estado: 'activa', empresa: 'McKinsey', descripcion_general: 'Analista Junior' },
    { id: '60000003-0000-0000-0000-000000000003', exalumno_id: 'e1000003-0000-0000-0000-000000000003', estado: 'activa', empresa: 'Boston Scientific', descripcion_general: 'Pasantía en Ingeniería' },
    { id: '60000004-0000-0000-0000-000000000004', exalumno_id: 'e1000005-0000-0000-0000-000000000005', estado: 'activa', empresa: 'AWS', descripcion_general: 'Cloud Solutions Architect' },
  ]);

  console.log('\n📂  Bloque 9 — curriculum_versiones');
  await upsert('curriculum_versiones', [
    { id: '8e100001-0000-0000-0000-000000000001', curriculum_id: 'c1000001-0000-0000-0000-000000000001', posicion_id: '60000001-0000-0000-0000-000000000001', nombre_version: 'CV Adaptado — Intel', contenido_adaptado: { objetivo: 'Pasante de firmware' }, sugerencias_ia: [] },
    { id: '8e100001-0000-0000-0000-000000000002', curriculum_id: 'c1000001-0000-0000-0000-000000000001', posicion_id: '60000004-0000-0000-0000-000000000004', nombre_version: 'CV Adaptado — AWS', contenido_adaptado: { objetivo: 'Desarrolladora Cloud' }, sugerencias_ia: [] },
    { id: '8e100002-0000-0000-0000-000000000001', curriculum_id: 'c1000002-0000-0000-0000-000000000002', posicion_id: '60000001-0000-0000-0000-000000000001', nombre_version: 'CV Adaptado — Intel Security', contenido_adaptado: { objetivo: 'Desarrollador backend seguridad' }, sugerencias_ia: [] },
    { id: '8e100004-0000-0000-0000-000000000001', curriculum_id: 'c1000004-0000-0000-0000-000000000004', posicion_id: '60000003-0000-0000-0000-000000000003', nombre_version: 'CV Adaptado — Boston Scientific', contenido_adaptado: { objetivo: 'Ingeniero Eléctrico' }, sugerencias_ia: [] },
  ]);

  console.log('\n📂  Bloque 10 — aplicaciones');
  await upsert('aplicaciones', [
    { id: 'a6600001-0000-0000-0000-000000000001', posicion_id: '60000001-0000-0000-0000-000000000001', estudiante_id: '52000001-0000-0000-0000-000000000001', curriculum_version_id: '8e100001-0000-0000-0000-000000000001', mensaje_presentacion: 'Me apasiona...', estado: 'en_revision' },
    { id: 'a6600002-0000-0000-0000-000000000002', posicion_id: '60000001-0000-0000-0000-000000000001', estudiante_id: '52000002-0000-0000-0000-000000000002', curriculum_version_id: '8e100002-0000-0000-0000-000000000001', mensaje_presentacion: 'Mi experiencia...', estado: 'seleccionado' },
    { id: 'a6600003-0000-0000-0000-000000000003', posicion_id: '60000003-0000-0000-0000-000000000003', estudiante_id: '52000004-0000-0000-0000-000000000004', curriculum_version_id: '8e100004-0000-0000-0000-000000000001', mensaje_presentacion: 'Mi TFG...', estado: 'enviada' },
  ]);

  console.log('\n📂  Bloque 11 — matches');
  await upsert('matches', [
    { id: '3a000001-0000-0000-0000-000000000001', estudiante_id: '52000001-0000-0000-0000-000000000001', exalumno_id: 'e1000001-0000-0000-0000-000000000001', score_match: 92, estado: 'activo', tipo_apoyo: 'mentoria', iniciado_por: 'plataforma', resultado: 'en_progreso' },
    { id: '3a000002-0000-0000-0000-000000000002', estudiante_id: '52000002-0000-0000-0000-000000000002', exalumno_id: 'e1000004-0000-0000-0000-000000000004', score_match: 78, estado: 'contactado', tipo_apoyo: 'empleo', iniciado_por: 'plataforma', resultado: 'en_progreso' },
    { id: '3a000003-0000-0000-0000-000000000003', estudiante_id: '52000003-0000-0000-0000-000000000003', exalumno_id: 'e1000006-0000-0000-0000-000000000006', score_match: 85, estado: 'sugerido', tipo_apoyo: 'mentoria', iniciado_por: 'plataforma', resultado: 'en_progreso' },
  ]);

  console.log('\n📂  Bloque 12 — donaciones');
  await upsert('donaciones', [
    { id: 'd0400001-0000-0000-0000-000000000001', exalumno_id: 'e1000001-0000-0000-0000-000000000001', proyecto_estudiante_id: '52000001-0000-0000-0000-000000000001', monto: 150000.00, moneda: 'CRC', metodo_pago: 'sinpe', fecha_transferencia: '2024-05-10', numero_referencia: 'REF001', comprobante_url: 'https://storage/comp001.pdf', estado: 'confirmada', confirmado_por: 'aa000001-0000-0000-0000-000000000001' },
    { id: 'd0400002-0000-0000-0000-000000000002', exalumno_id: 'e1000006-0000-0000-0000-000000000006', proyecto_estudiante_id: '52000002-0000-0000-0000-000000000002', monto: 250.00, moneda: 'USD', metodo_pago: 'transferencia_bancaria', fecha_transferencia: '2024-05-15', numero_referencia: 'REF002', comprobante_url: 'https://storage/comp002.pdf', estado: 'confirmada', confirmado_por: 'aa000002-0000-0000-0000-000000000002' },
  ]);

  console.log('\n🎉  ¡Seed aplicado exitosamente!');
}

main().catch(e => {
  console.error('\n❌  Error fatal:', e.message);
  process.exit(1);
});
