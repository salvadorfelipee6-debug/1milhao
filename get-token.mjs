import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)
const rows = await sql`SELECT instagram_handle, edit_token FROM blocks LIMIT 5`
console.table(rows)
