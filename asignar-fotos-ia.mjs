import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const avatarPool = [
  '/avatars/avatar-1.png',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.png',
  '/avatars/avatar-5.png',
  '/avatars/avatar-6.png'
];

async function updateProfiles() {
  console.log("Obteniendo usuarios sin foto de perfil...");
  
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, foto_url')
    .or('foto_url.is.null,foto_url.eq.');

  if (fetchError) {
    console.error("Error al obtener usuarios:", fetchError.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log("Todos los usuarios ya tienen foto de perfil.");
    return;
  }

  console.log(`Se encontraron ${users.length} usuarios sin foto de perfil. Asignando avatares...`);
  let updatedCount = 0;

  for (const user of users) {
    const randomAvatar = avatarPool[Math.floor(Math.random() * avatarPool.length)];
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ foto_url: randomAvatar })
      .eq('id', user.id);

    if (updateError) {
      console.error(`Error actualizando el usuario ${user.id}:`, updateError.message);
    } else {
      updatedCount++;
      console.log(`Usuario ${user.id} actualizado con ${randomAvatar}`);
    }
  }

  console.log(`\n¡Proceso completado! Se actualizaron ${updatedCount} usuarios.`);
}

updateProfiles().catch(console.error);
