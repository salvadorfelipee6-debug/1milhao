import 'server-only'
import { db, schema } from '.'
import { eq, and, desc } from 'drizzle-orm'

export async function createProposal(data: {
  brandId:      string
  blockId:      string
  message:      string
  budget?:      string
  campaignType?: string
  deadline?:    string
}) {
  const [proposal] = await db.insert(schema.proposals).values(data).returning()
  return proposal
}

// Propostas recebidas por um bloco (visão do influencer) — já traz os dados da marca
export async function getProposalsForBlock(blockId: string) {
  const rows = await db
    .select({
      id:           schema.proposals.id,
      message:      schema.proposals.message,
      budget:       schema.proposals.budget,
      campaignType: schema.proposals.campaignType,
      deadline:     schema.proposals.deadline,
      status:       schema.proposals.status,
      sentAt:       schema.proposals.sentAt,
      companyName:  schema.brands.companyName,
      segment:      schema.brands.segment,
      contactName:  schema.brands.contactName,
      contactEmail: schema.brands.contactEmail,
      contactWhatsapp: schema.brands.contactWhatsapp,
    })
    .from(schema.proposals)
    .innerJoin(schema.brands, eq(schema.proposals.brandId, schema.brands.id))
    .where(eq(schema.proposals.blockId, blockId))
    .orderBy(desc(schema.proposals.sentAt))

  return rows
}

// Propostas enviadas por uma marca (visão da marca) — já traz os dados do bloco
export async function getProposalsForBrand(brandId: string) {
  const rows = await db
    .select({
      id:              schema.proposals.id,
      message:         schema.proposals.message,
      budget:          schema.proposals.budget,
      campaignType:    schema.proposals.campaignType,
      deadline:        schema.proposals.deadline,
      status:          schema.proposals.status,
      sentAt:          schema.proposals.sentAt,
      instagramHandle: schema.blocks.instagramHandle,
      displayName:     schema.blocks.displayName,
      avatarUrl:       schema.blocks.avatarUrl,
      niche:           schema.blocks.niche,
      colorHex:        schema.blocks.colorHex,
    })
    .from(schema.proposals)
    .innerJoin(schema.blocks, eq(schema.proposals.blockId, schema.blocks.id))
    .where(eq(schema.proposals.brandId, brandId))
    .orderBy(desc(schema.proposals.sentAt))

  return rows
}

// Marca como lidas as propostas ainda não lidas de um bloco (quando o painel é aberto)
export async function markProposalsRead(blockId: string) {
  await db
    .update(schema.proposals)
    .set({ status: 'read', readAt: new Date() })
    .where(and(eq(schema.proposals.blockId, blockId), eq(schema.proposals.status, 'sent')))
}

// Influencer aceita ou recusa — valida que a proposta é mesmo do bloco dele
export async function respondToProposal(
  proposalId: string,
  blockId: string,
  status: 'accepted' | 'declined'
) {
  const result = await db
    .update(schema.proposals)
    .set({ status })
    .where(and(eq(schema.proposals.id, proposalId), eq(schema.proposals.blockId, blockId)))
    .returning({ id: schema.proposals.id })

  return result.length > 0
}
