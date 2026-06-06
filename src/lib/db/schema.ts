import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────
export const blockStatusEnum = pgEnum('block_status', [
  'pending',
  'active',
  'suspended',
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
])

export const paymentProviderEnum = pgEnum('payment_provider', [
  'stripe',
  'mercadopago',
])

export const proposalStatusEnum = pgEnum('proposal_status', [
  'sent',
  'read',
  'accepted',
  'declined',
])

export const nicheEnum = pgEnum('niche', [
  'fitness',
  'moda',
  'tecnologia',
  'gastronomia',
  'beleza',
  'viagens',
  'games',
  'financas',
  'familia',
  'humor',
  'educacao',
  'outros',
])

export const brandPlanEnum = pgEnum('brand_plan', ['free', 'pro', 'enterprise'])

// ─── Tabela: blocks ───────────────────────────────────────
export const blocks = pgTable(
  'blocks',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    userId:           varchar('user_id', { length: 255 }).notNull(),

    // Dados do influencer
    instagramHandle:  varchar('instagram_handle', { length: 100 }).notNull(),
    displayName:      varchar('display_name', { length: 150 }).notNull(),
    niche:            nicheEnum('niche').notNull().default('outros'),
    city:             varchar('city', { length: 80 }),
    followers:        varchar('followers', { length: 30 }),
    bio:              text('bio'),
    videoUrl:         text('video_url'),
    websiteUrl:       text('website_url'),
    avatarUrl:        text('avatar_url'),
    colorHex:         varchar('color_hex', { length: 7 }).notNull().default('#E1306C'),

    // Redes sociais
    whatsappUrl:      varchar('whatsapp_url', { length: 30 }),
    youtubeUrl:       text('youtube_url'),
    tiktokUrl:        text('tiktok_url'),
    twitterUrl:       text('twitter_url'),
    facebookUrl:      text('facebook_url'),
    kwaiUrl:          text('kwai_url'),
    onlyfansUrl:      text('onlyfans_url'),
    spotifyUrl:       text('spotify_url'),

    // Links personalizados (JSON array)
    customLinks:      text('custom_links'),

    // Posição na grade (grade 1000×1000)
    pixelX:           integer('pixel_x').notNull().default(0),
    pixelY:           integer('pixel_y').notNull().default(0),
    pixelWidth:       integer('pixel_width').notNull().default(10),
    pixelHeight:      integer('pixel_height').notNull().default(10),
    pixelCount:       integer('pixel_count').notNull().default(100),

    // Status
    status:           blockStatusEnum('status').notNull().default('pending'),
    editToken:        varchar('edit_token', { length: 64 }),

    createdAt:        timestamp('created_at').notNull().defaultNow(),
    updatedAt:        timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    instagramIdx:    index('blocks_instagram_idx').on(t.instagramHandle),
    statusIdx:       index('blocks_status_idx').on(t.status),
    nicheIdx:        index('blocks_niche_idx').on(t.niche),
    positionIdx:     index('blocks_position_idx').on(t.pixelX, t.pixelY),
    userIdx:         index('blocks_user_idx').on(t.userId),
    uniqueInstagram: uniqueIndex('blocks_instagram_unique').on(t.instagramHandle),
  })
)

// ─── Tabela: payments ─────────────────────────────────────
export const payments = pgTable(
  'payments',
  {
    id:              uuid('id').primaryKey().defaultRandom(),
    blockId:         uuid('block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
    provider:        paymentProviderEnum('provider').notNull(),
    externalId:      varchar('external_id', { length: 255 }),
    pixelCount:      integer('pixel_count').notNull(),
    amountBrl:       decimal('amount_brl', { precision: 10, scale: 2 }).notNull(),
    status:          paymentStatusEnum('status').notNull().default('pending'),
    paidAt:          timestamp('paid_at'),
    createdAt:       timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    blockIdx:    index('payments_block_idx').on(t.blockId),
    statusIdx:   index('payments_status_idx').on(t.status),
    externalIdx: index('payments_external_idx').on(t.externalId),
  })
)

// ─── Tabela: analytics ────────────────────────────────────
export const analytics = pgTable(
  'analytics',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    blockId:     uuid('block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
    eventType:   varchar('event_type', { length: 30 }).notNull(),
    ip:          varchar('ip', { length: 45 }),
    eventDate:   timestamp('event_date').notNull().defaultNow(),
  },
  (t) => ({
    blockDateIdx: index('analytics_block_date_idx').on(t.blockId, t.eventDate),
    eventIdx:     index('analytics_event_idx').on(t.eventType),
  })
)

// ─── Tabela: affiliates ───────────────────────────────────
export const affiliates = pgTable(
  'affiliates',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    blockId:       uuid('block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }).unique(),
    refCode:       varchar('ref_code', { length: 50 }).notNull().unique(),
    totalClicks:   integer('total_clicks').notNull().default(0),
    totalSignups:  integer('total_signups').notNull().default(0),
    totalEarned:   decimal('total_earned', { precision: 10, scale: 2 }).notNull().default('0'),
    totalPaid:     decimal('total_paid', { precision: 10, scale: 2 }).notNull().default('0'),
    pixKey:        varchar('pix_key', { length: 200 }),
    createdAt:     timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    refCodeIdx: index('affiliates_ref_code_idx').on(t.refCode),
  })
)

// ─── Tabela: brands ───────────────────────────────────────
export const brands = pgTable(
  'brands',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    companyName:      varchar('company_name', { length: 150 }).notNull(),
    segment:          varchar('segment', { length: 80 }),
    contactName:      varchar('contact_name', { length: 150 }).notNull(),
    contactEmail:     varchar('contact_email', { length: 200 }).notNull().unique(),
    contactWhatsapp:  varchar('contact_whatsapp', { length: 30 }),
    passwordHash:     text('password_hash').notNull(),
    plan:             brandPlanEnum('plan').notNull().default('free'),
    searchesUsed:     integer('searches_used').notNull().default(0),
    createdAt:        timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index('brands_email_idx').on(t.contactEmail),
  })
)

// ─── Tabela: proposals ────────────────────────────────────
export const proposals = pgTable(
  'proposals',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    brandId:       uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
    blockId:       uuid('block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
    message:       text('message').notNull(),
    budget:        varchar('budget', { length: 50 }),
    campaignType:  varchar('campaign_type', { length: 80 }),
    status:        proposalStatusEnum('status').notNull().default('sent'),
    sentAt:        timestamp('sent_at').notNull().defaultNow(),
    readAt:        timestamp('read_at'),
  },
  (t) => ({
    brandIdx: index('proposals_brand_idx').on(t.brandId),
    blockIdx: index('proposals_block_idx').on(t.blockId),
  })
)

// ─── Tabela: favorites ────────────────────────────────────
export const favorites = pgTable(
  'favorites',
  {
    id:       uuid('id').primaryKey().defaultRandom(),
    brandId:  uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
    blockId:  uuid('block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
    savedAt:  timestamp('saved_at').notNull().defaultNow(),
  },
  (t) => ({
    uniqueFav: uniqueIndex('favorites_unique').on(t.brandId, t.blockId),
  })
)

// ─── Relations ────────────────────────────────────────────
export const blocksRelations = relations(blocks, ({ many, one }) => ({
  payments:  many(payments),
  analytics: many(analytics),
  affiliate: one(affiliates, { fields: [blocks.id], references: [affiliates.blockId] }),
  proposals: many(proposals),
  favorites: many(favorites),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  block: one(blocks, { fields: [payments.blockId], references: [blocks.id] }),
}))

export const brandsRelations = relations(brands, ({ many }) => ({
  proposals: many(proposals),
  favorites: many(favorites),
}))

// ─── Types inferidos ──────────────────────────────────────
export type Block      = typeof blocks.$inferSelect
export type NewBlock   = typeof blocks.$inferInsert
export type Payment    = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
export type Analytics  = typeof analytics.$inferSelect
export type Affiliate  = typeof affiliates.$inferSelect
export type Brand      = typeof brands.$inferSelect
export type Proposal   = typeof proposals.$inferSelect