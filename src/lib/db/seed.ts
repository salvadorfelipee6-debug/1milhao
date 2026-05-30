import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
const db  = drizzle(sql, { schema })

const blocks = [
  { instagramHandle: 'carol.fit',      displayName: 'Carol Fitness',   niche: 'fitness'     as const, city: 'São Paulo',     followers: '128k', pixelX: 0,   pixelY: 0,  pixelWidth: 30, pixelHeight: 30, pixelCount: 900,  colorHex: '#E1306C' },
  { instagramHandle: 'techcomleandro', displayName: 'Leandro Tech',    niche: 'tecnologia'  as const, city: 'Belo Horizonte',followers: '210k', pixelX: 30,  pixelY: 0,  pixelWidth: 40, pixelHeight: 40, pixelCount: 1600, colorHex: '#405DE6' },
  { instagramHandle: 'chefmarcelo',    displayName: 'Chef Marcelo',    niche: 'gastronomia' as const, city: 'Rio de Janeiro',followers: '84k',  pixelX: 70,  pixelY: 0,  pixelWidth: 20, pixelHeight: 20, pixelCount: 400,  colorHex: '#F77737' },
  { instagramHandle: 'modaporana',     displayName: 'Moda por Ana',    niche: 'moda'        as const, city: 'Florianópolis', followers: '55k',  pixelX: 0,   pixelY: 30, pixelWidth: 20, pixelHeight: 20, pixelCount: 400,  colorHex: '#833AB4' },
  { instagramHandle: 'viajandosempre', displayName: 'Viajando Sempre', niche: 'viagens'     as const, city: 'São Paulo',     followers: '320k', pixelX: 90,  pixelY: 0,  pixelWidth: 30, pixelHeight: 30, pixelCount: 900,  colorHex: '#5851DB' },
  { instagramHandle: 'belezanaturalz', displayName: 'Beleza Natural',  niche: 'beleza'      as const, city: 'Rio de Janeiro',followers: '91k',  pixelX: 20,  pixelY: 30, pixelWidth: 20, pixelHeight: 20, pixelCount: 400,  colorHex: '#C13584' },
  { instagramHandle: 'gamerzaobr',     displayName: 'Gamerzão BR',     niche: 'games'       as const, city: 'Porto Alegre',  followers: '165k', pixelX: 40,  pixelY: 40, pixelWidth: 30, pixelHeight: 30, pixelCount: 900,  colorHex: '#405DE6' },
  { instagramHandle: 'financasbr',     displayName: 'Finanças BR',     niche: 'financas'    as const, city: 'São Paulo',     followers: '440k', pixelX: 120, pixelY: 0,  pixelWidth: 50, pixelHeight: 50, pixelCount: 2500, colorHex: '#0095F6' },
  { instagramHandle: 'mamaemoderna',   displayName: 'Mamãe Moderna',   niche: 'familia'     as const, city: 'Curitiba',      followers: '73k',  pixelX: 0,   pixelY: 50, pixelWidth: 20, pixelHeight: 20, pixelCount: 400,  colorHex: '#E1306C' },
  { instagramHandle: 'humordobem',     displayName: 'Humor do Bem',    niche: 'humor'       as const, city: 'Salvador',      followers: '195k', pixelX: 70,  pixelY: 40, pixelWidth: 20, pixelHeight: 20, pixelCount: 400,  colorHex: '#FCAF45' },
]

async function seed() {
  console.log('Inserindo blocos de teste...')
  for (const b of blocks) {
    await db.insert(schema.blocks).values({
      userId:          'seed',
      instagramHandle: b.instagramHandle,
      displayName:     b.displayName,
      niche:           b.niche,
      city:            b.city,
      followers:       b.followers,
      bio:             `Conteúdo de ${b.displayName} no Instagram.`,
      colorHex:        b.colorHex,
      pixelX:          b.pixelX,
      pixelY:          b.pixelY,
      pixelWidth:      b.pixelWidth,
      pixelHeight:     b.pixelHeight,
      pixelCount:      b.pixelCount,
      status:          'active',
      editToken:       Math.random().toString(36).slice(2),
    }).onConflictDoNothing()
  }
  console.log('10 blocos inseridos!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
