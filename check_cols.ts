import { config } from 'dotenv'
config({ path: '.env' })
import { createAdminClient } from './src/lib/supabase/admin'

async function checkColumns() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('donations').select('*').limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]))
    } else {
      console.log('No data, cannot infer columns from empty table using select *')
    }
  }
}

checkColumns()
