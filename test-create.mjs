import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vzcjppbvmbhcnrempuxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2pwcGJ2bWJoY25yZW1wdXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxMDY5MCwiZXhwIjoyMDk1OTg2NjkwfQ.tMYXuDqriSrhR2jllBL-nz9gNo66ORTOVWPsAL6GFLE';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log("Creando usuario estudiante...");
  const { data: studentAuth, error: err1 } = await supabase.auth.admin.createUser({
    email: `test_student_${Date.now()}@ucr.ac.cr`,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      nombre: 'Ana',
      apellidos: 'Estudiante Prueba',
      rol: 'estudiante'
    }
  });

  if (err1) {
    console.error("Error creating student auth:", err1);
  } else {
    const sId = studentAuth.user.id;
    await supabase.from('users').upsert({
      id: sId,
      nombre: 'Ana',
      apellidos: 'Estudiante Prueba',
      email: studentAuth.user.email,
      rol: 'estudiante',
      perfil_completo: true,
      visible_en_directorio: true,
      busca_mentoria: true,
      busca_empleo: false,
      busca_pasantia: false
    });
    
    await supabase.from('profiles').upsert({
      id: sId,
      full_name: 'Ana Estudiante Prueba',
      es_exalumno: false,
      perfil_completo: true,
      academic: [{ carrera: 'Ingeniería', escuela: 'Ingeniería', anio: 2024 }]
    });

    await supabase.from('estudiantes').upsert({
      user_id: sId,
      carnet_ucr: 'A00001',
      carrera: 'Ingeniería Industrial',
      escuela_facultad: 'Ingeniería',
      sede: 'Sede Rodrigo Facio',
      anio_ingreso: 2020,
      proyecto_titulo: 'Optimización de Procesos',
      proyecto_descripcion: 'Un proyecto innovador para mejorar los procesos.',
      proyecto_area_tematica: 'Tecnología',
      proyecto_tipo: 'tfg',
      proyecto_porcentaje_avance: 50,
      areas_de_interes: ['Tecnología', 'Innovación'],
      busca_financiamiento: true,
      busca_mentoria: true,
      busca_empleo: false,
      busca_pasantia: false
    });
    console.log("✅ Estudiante creado:", studentAuth.user.email);
  }

  console.log("Creando usuario exalumno...");
  const { data: exAuth, error: err2 } = await supabase.auth.admin.createUser({
    email: `test_exalumno_${Date.now()}@gmail.com`,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      nombre: 'Carlos',
      apellidos: 'Exalumno Prueba',
      rol: 'exalumno'
    }
  });

  if (err2) {
    console.error("Error creating exalumno auth:", err2);
  } else {
    const eId = exAuth.user.id;
    await supabase.from('users').upsert({
      id: eId,
      nombre: 'Carlos',
      apellidos: 'Exalumno Prueba',
      email: exAuth.user.email,
      rol: 'exalumno',
      perfil_completo: true,
      visible_en_directorio: true
    });

    await supabase.from('profiles').upsert({
      id: eId,
      full_name: 'Carlos Exalumno Prueba',
      es_exalumno: true,
      perfil_completo: true,
      empresa_actual: 'Empresa XYZ',
      cargo_actual: 'Gerente',
      areas_de_interes: ['Negocios', 'Consultoría'],
      ofrece_mentoria: true,
      ofrece_empleo: false,
      ofrece_pasantia: true
    });

    await supabase.from('exalumnos').upsert({
      id: eId,
      user_id: eId,
      carrera_ucr: 'Administración de Negocios',
      escuela_facultad: 'Ciencias Económicas',
      anio_graduacion: 2015,
      empresa_actual: 'Empresa XYZ',
      cargo_actual: 'Gerente',
      areas_de_interes: ['Negocios', 'Consultoría'],
      ofrece_mentoria: true,
      ofrece_pasantia: true,
      ofrece_empleo: false,
      ofrece_proyecto: false,
      ofrece_donacion_dinero: false,
      visible_en_directorio: true,
      perfil_completo: true
    });
    console.log("✅ Exalumno creado:", exAuth.user.email);
  }
}

main().catch(console.error);
