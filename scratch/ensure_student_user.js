const fs = require('fs');
const path = require('path');

// Load env.local variables manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const value = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    }
  });
}

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function run() {
  const userId = generateUUID();
  const email = `estudiante1@ucr.ac.cr`;
  const nombre = 'Juan';
  const apellidos = 'Estudiante';

  console.log('Creando/re-creando estudiante de prueba...');
  console.log('ID:', userId);
  console.log('Email:', email);

  // Intentamos crear el usuario en auth (si ya existe dará error, pero podemos atraparlo)
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: 'UCRAlumni2026!',
    email_confirm: true,
    user_metadata: { nombre: nombre, apellidos: apellidos, rol: 'estudiante' }
  });

  let createdId = userId;
  if (authError) {
    console.log('Auth user ya existe o falló la creación, buscando existente...');
    const { data: existingAuthUsers, error: listError } = await supabase.auth.admin.listUsers();
    const match = existingAuthUsers?.users?.find(u => u.email === email);
    if (match) {
      createdId = match.id;
      console.log('ID existente encontrado:', createdId);
    } else {
      console.error('Error al crear auth user:', authError);
      return;
    }
  } else {
    createdId = authUser.user.id;
    console.log('Creado en auth.users con ID:', createdId);
  }

  // 2. Insertar en public.users
  const { data: existingUser, error: getError } = await supabase
    .from('users')
    .select('id')
    .eq('id', createdId)
    .maybeSingle();

  if (getError || !existingUser) {
    const { error: insertUserError } = await supabase
      .from('users')
      .insert({
        id: createdId,
        email: email,
        nombre: nombre,
        apellidos: apellidos,
        rol: 'estudiante',
        email_verified: true,
        activo: true,
        busca_mentoria: false,
        busca_empleo: false,
        busca_pasantia: false,
        ofrece_mentoria: false,
        visible_en_directorio: true
      });
    if (insertUserError) {
      console.error('Error al insertar en public.users:', insertUserError);
      return;
    }
  } else {
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        rol: 'estudiante',
        busca_mentoria: false,
        busca_empleo: false,
        busca_pasantia: false,
        ofrece_mentoria: false,
        visible_en_directorio: true
      })
      .eq('id', createdId);
    if (updateUserError) {
      console.error('Error al actualizar public.users:', updateUserError);
    }
  }

  // 3. Insertar/actualizar en public.estudiantes
  const { data: existingEst, error: getEstError } = await supabase
    .from('estudiantes')
    .select('id')
    .eq('id', createdId)
    .maybeSingle();

  if (getEstError || !existingEst) {
    const { error: insertEstudianteError } = await supabase
      .from('estudiantes')
      .insert({
        id: createdId,
        user_id: createdId,
        carnet_ucr: `C0${Math.floor(Math.random() * 90000) + 10000}`,
        carrera: 'Ciencias de la Computación e Informática',
        escuela_facultad: 'Facultad de Ingeniería',
        sede: 'Rodrigo Facio',
        anio_ingreso: 2022,
        nivel_academico: 'bachillerato',
        proyecto_titulo: 'Desarrollo de Plataforma Solidaria UCR',
        proyecto_descripcion: 'Un proyecto mock para recibir donaciones y apoyo económico de la comunidad de graduados.',
        proyecto_area_tematica: 'Tecnología',
        proyecto_tipo: 'tfg',
        areas_de_interes: ['Tecnología e Innovación', 'Emprendimiento y Negocios'],
        habilidades: ['React', 'Next.js', 'PostgreSQL'],
        visible_en_directorio: true,
        perfil_completo: true,
        busca_financiamiento: true
      });

    if (insertEstudianteError) {
      console.error('Error al insertar en public.estudiantes:', insertEstudianteError);
      return;
    }
  } else {
    const { error: updateEstError } = await supabase
      .from('estudiantes')
      .update({
        perfil_completo: true,
        busca_financiamiento: true
      })
      .eq('id', createdId);
    if (updateEstError) {
      console.error('Error al actualizar public.estudiantes:', updateEstError);
    }
  }

  console.log('\n✅ ¡Usuario y perfil de estudiante listos con credenciales deseadas!');
  console.log('Email:', email);
  console.log('Contraseña:', 'UCRAlumni2026!');
}

run();
