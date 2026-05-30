import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Conexão singleton com o banco Neon
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

export { schema }
