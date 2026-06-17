const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Cargar variables de entorno
const envConfig = dotenv.parse(fs.readFileSync('.env'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🚀 Iniciando inyección de datos para Journey 2 (Estudiante busca mentoría)\n');

  // 1. Crear usuario estudiante (Tayro Arce)
  const estudianteEmail = 'tayroarce@gmail.com';
  console.log(`Creando estudiante de prueba: ${estudianteEmail}`);
  
  let { data: estAuthData, error: estAuthError } = await supabase.auth.admin.createUser({
    email: estudianteEmail,
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { nombre: 'Tayro', apellidos: 'Arce', rol: 'estudiante' }
  });

  // Si ya existe, tratamos de obtenerlo
  if (estAuthError && estAuthError.message.includes('already registered')) {
    console.log('El usuario ya existe, obteniendo su ID...');
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const existingUser = usersData.users.find(u => u.email === estudianteEmail);
    if (existingUser) {
      estAuthData = { user: existingUser };
      // Actualizar metadatos por si acaso
      await supabase.auth.admin.updateUserById(existingUser.id, {
        user_metadata: { nombre: 'Tayro', apellidos: 'Arce', rol: 'estudiante' }
      });
    }
  } else if (estAuthError) {
    throw estAuthError;
  }

  const estudianteId = estAuthData.user.id;

  // Actualizar public.users
  await supabase.from('users').upsert({
    id: estudianteId,
    email: estudianteEmail,
    nombre: 'Tayro',
    apellidos: 'Arce',
    rol: 'estudiante',
    email_verified: true,
    activo: true,
    busca_mentoria: true,
    busca_empleo: false,
    visible_en_directorio: true
  });

  // Asegurar que el estudiante tenga el perfil con el proyecto de IA
  await supabase.from('estudiantes').upsert({
    id: estudianteId,
    user_id: estudianteId,
    carnet_ucr: 'B12345',
    carrera: 'Ingeniería en Sistemas',
    escuela_facultad: 'Facultad de Ingeniería',
    sede: 'Rodrigo Facio',
    anio_ingreso: 2021,
    nivel_academico: 'bachillerato',
    proyecto_titulo: 'Proyecto de Diagnóstico Médico',
    proyecto_descripcion: 'Uso de IA para detección de enfermedades',
    proyecto_area_tematica: 'IA en Salud',
    proyecto_tipo: 'tfg',
    areas_de_interes: ['IA en Salud', 'Tecnología', 'Desarrollo Backend'],
    visible_en_directorio: true,
    perfil_completo: true
  });

  console.log(`✅ Estudiante configurado (ID: ${estudianteId})`);

  // 2. Crear 5 Exalumnos
  const exalumnosMocks = [
    {
      email: 'exalumno1@ucr.test', nombre: 'Carlos', apellidos: 'Mendez',
      empresa: 'Empresa de Salud Digital', cargo: 'Ingeniero en Sistemas',
      sector: ['IA en Salud', 'Tecnología'],
      isPerfectMatch: true
    },
    {
      email: 'exalumno2@ucr.test', nombre: 'Maria', apellidos: 'Salas',
      empresa: 'Amazon', cargo: 'Desarrolladora',
      sector: ['Tecnología', 'Cloud'],
      isPerfectMatch: false
    },
    {
      email: 'exalumno3@ucr.test', nombre: 'Juan', apellidos: 'Perez',
      empresa: 'Microsoft', cargo: 'Ingeniero de Datos',
      sector: ['Datos', 'Tecnología'],
      isPerfectMatch: false
    },
    {
      email: 'exalumno4@ucr.test', nombre: 'Laura', apellidos: 'Gomez',
      empresa: 'Caja Costarricense', cargo: 'Arquitecta de Software',
      sector: ['Salud', 'Desarrollo'],
      isPerfectMatch: false
    },
    {
      email: 'exalumno5@ucr.test', nombre: 'Andres', apellidos: 'Rojas',
      empresa: 'Startup X', cargo: 'CTO',
      sector: ['Innovación', 'Startups'],
      isPerfectMatch: false
    }
  ];

  const exalumnosIds = [];

  for (const mock of exalumnosMocks) {
    console.log(`Creando exalumno de prueba: ${mock.email}`);
    let { data: exAuthData, error: exAuthError } = await supabase.auth.admin.createUser({
      email: mock.email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { nombre: mock.nombre, apellidos: mock.apellidos, rol: 'exalumno' }
    });

    if (exAuthError && exAuthError.message.includes('already registered')) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = usersData.users.find(u => u.email === mock.email);
      if (existingUser) exAuthData = { user: existingUser };
    }

    const exalumnoId = exAuthData.user.id;
    exalumnosIds.push({ id: exalumnoId, isPerfectMatch: mock.isPerfectMatch });

    // Actualizar public.users
    await supabase.from('users').upsert({
      id: exalumnoId,
      email: mock.email,
      nombre: mock.nombre,
      apellidos: mock.apellidos,
      rol: 'exalumno',
      email_verified: true,
      activo: true,
      ofrece_mentoria: true,
      visible_en_directorio: true
    });

    // Actualizar public.exalumnos
    await supabase.from('exalumnos').upsert({
      id: exalumnoId,
      user_id: exalumnoId,
      carrera_ucr: 'Ingeniería en Sistemas',
      escuela_facultad: 'Facultad de Ingeniería',
      anio_graduacion: 2018,
      empresa_actual: mock.empresa,
      cargo_actual: mock.cargo,
      sector_industria: mock.sector,
      areas_de_interes: mock.sector,
      pais_ciudad: 'Costa Rica',
      anios_experiencia: 5,
      linkedin_url: 'https://linkedin.com/in/test',
      ofrece_mentoria: true,
      visible_en_directorio: true,
      perfil_completo: true
    });
  }

  console.log(`✅ 5 Exalumnos configurados`);

  // 3. Forzar los Matches (Bypass del cálculo para asegurar el Journey)
  // Aunque el nuevo match_generator funciona dinámicamente, inyectaremos
  // explícitamente el match con score 85 al ingeniero en sistemas.
  console.log('Limpiando y creando matches forzados para el Journey...');
  
  await supabase.from('matches').delete().eq('estudiante_id', estudianteId);

  const matchesAInsertar = exalumnosIds.map(ex => {
    return {
      estudiante_id: estudianteId,
      exalumno_id: ex.id,
      tipo_apoyo: 'mentoria',
      score_match: ex.isPerfectMatch ? 85 : Math.floor(Math.random() * (70 - 40 + 1) + 40), // Los demás tendrán entre 40 y 70
      estado: 'sugerido',
      iniciado_por: 'plataforma',
    };
  });

  const { error: matchError } = await supabase.from('matches').insert(matchesAInsertar);
  
  if (matchError) {
    console.error('Error insertando matches:', matchError);
  } else {
    console.log('✅ Matches inyectados correctamente con el score deseado.');
  }

  console.log('\n🎉 INYECCIÓN COMPLETADA EXITOSAMENTE');
  console.log('Puedes probar el Journey 2 iniciando sesión con:');
  console.log(`Estudiante: ${estudianteEmail} / Password123!`);
  console.log(`Exalumno (Perfect Match): exalumno1@ucr.test / Password123!`);
}

main().catch(console.error);
