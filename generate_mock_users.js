const fs = require('fs');

const { v4: uuidv4 } = require('crypto');

function generateUUID() {
  // simple mock uuid using crypto
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Elena', 'Diego', 'Lucia', 'Pedro', 'Sofia', 'Andres', 'Valeria', 'Daniel', 'Valentina', 'Jose', 'Camila', 'Marco', 'Laura', 'Gabriel', 'Isabella'];
const lastNames = ['Gomez', 'Rodriguez', 'Fernandez', 'Lopez', 'Martinez', 'Perez', 'Garcia', 'Sanchez', 'Romero', 'Sosa', 'Alvarez', 'Ruiz', 'Diaz', 'Suarez', 'Molina', 'Castro', 'Ortiz', 'Vargas', 'Ramos', 'Nunez'];
const careers = ['Ciencias de la Computación e Informática', 'Ingeniería Eléctrica', 'Dirección de Empresas', 'Derecho', 'Psicología', 'Medicina y Cirugía', 'Arquitectura'];
const campuses = ['Rodrigo Facio', 'Occidente', 'Atlántico'];
const interests = ['Tecnología e Innovación', 'Salud y Bienestar', 'Educación y Pedagogía', 'Emprendimiento y Negocios', 'Medio Ambiente y Sostenibilidad'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let sql = `-- Seed script for 20 exalumnos and 20 estudiantes\n\n`;

const generateUsers = (role, count, startId) => {
    let insertsAuthUsers = [];
    let insertsAuthIdentities = [];
    let insertsPublicUsers = [];
    let insertsSpecific = [];
    let insertsUsersCarreras = [];
    let insertsAreasInteres = [];

    for (let i = 0; i < count; i++) {
        const id = generateUUID();
        const fname = getRandomItem(firstNames);
        const lname = getRandomItem(lastNames);
        const email = `${fname.toLowerCase()}.${lname.toLowerCase()}${Math.floor(Math.random() * 1000)}@${role === 'estudiante' ? 'ucr.ac.cr' : 'gmail.com'}`;
        const carrera = getRandomItem(careers);
        const campus = getRandomItem(campuses);
        const interest = getRandomItem(interests);

        insertsAuthUsers.push(`(
            '${id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            '${email}', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"${fname}","apellidos":"${lname}","rol":"${role}"}',
            now(), now(), '', '', '', ''
        )`);

        insertsAuthIdentities.push(`(
            '${id}', '${id}', '${id}', format('{"sub":"%s","email":"%s"}','${id}','${email}')::jsonb, 'email', now(), now(), now()
        )`);

        insertsPublicUsers.push(`(
            '${id}', '${email}', '${fname}', '${lname}', '${role}', TRUE, TRUE, NULL,
            ${role === 'estudiante' ? 'TRUE, TRUE, FALSE, FALSE' : 'FALSE, FALSE, FALSE, TRUE'}, TRUE, 0, now()
        )`);

        if (role === 'estudiante') {
            insertsSpecific.push(`(
                '${id}', '${id}', 'B${Math.floor(Math.random() * 90000) + 10000}', '${carrera}', 'Facultad Generica', '${campus}',
                ${2020 + Math.floor(Math.random() * 4)}, 'bachillerato', 'Proyecto TFG ${fname}', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['${interest}'], ARRAY['Liderazgo'], TRUE, TRUE
            )`);
        } else {
            insertsSpecific.push(`(
                '${id}', '${id}', '${carrera}', 'Facultad Generica', ${2010 + Math.floor(Math.random() * 10)},
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['${interest}'], 'Costa Rica', ${Math.floor(Math.random() * 10) + 1},
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            )`);
        }
    }

    sql += `-- Auth Users for ${role}\n`;
    sql += `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES \n`;
    sql += insertsAuthUsers.join(',\n') + `\nON CONFLICT DO NOTHING;\n\n`;

    sql += `-- Auth Identities for ${role}\n`;
    sql += `INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES \n`;
    sql += insertsAuthIdentities.join(',\n') + `\nON CONFLICT DO NOTHING;\n\n`;

    sql += `-- Public Users for ${role}\n`;
    sql += `INSERT INTO public.users (id, email, nombre, apellidos, rol, email_verified, activo, foto_url, busca_mentoria, busca_empleo, busca_pasantia, ofrece_mentoria, visible_en_directorio, reportes_recibidos, created_at) VALUES \n`;
    sql += insertsPublicUsers.join(',\n') + `\nON CONFLICT DO NOTHING;\n\n`;

    if (role === 'estudiante') {
        sql += `-- Estudiantes profiles\n`;
        sql += `INSERT INTO public.estudiantes (id, user_id, carnet_ucr, carrera, escuela_facultad, sede, anio_ingreso, nivel_academico, proyecto_titulo, proyecto_descripcion, proyecto_area_tematica, proyecto_tipo, areas_de_interes, habilidades, visible_en_directorio, perfil_completo) VALUES \n`;
    } else {
        sql += `-- Exalumnos profiles\n`;
        sql += `INSERT INTO public.exalumnos (id, user_id, carrera_ucr, escuela_facultad, anio_graduacion, empresa_actual, cargo_actual, sector_industria, areas_de_interes, pais_ciudad, anios_experiencia, linkedin_url, ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_proyecto, visible_en_directorio, perfil_completo) VALUES \n`;
    }
    sql += insertsSpecific.join(',\n') + `\nON CONFLICT DO NOTHING;\n\n`;

}

generateUsers('estudiante', 20);
generateUsers('exalumno', 20);

fs.writeFileSync('c:/Users/FWD8D/OneDrive/Desktop/UCR/exalumnos_ucr/supabase/seed_extra_users.sql', sql);
console.log('Generated supabase/seed_extra_users.sql');
