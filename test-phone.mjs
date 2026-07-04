import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase.from('profiles').select('phone').limit(1)
  console.log('Error testing phone column in profiles:', error?.message || 'No error, it might exist!')
  
  if (error && error.message.includes("Could not find the 'phone' column")) {
    console.log("Column phone doesn't exist, we must add it to the form and we can just save it to profiles or users table?")
  }
}
run()
