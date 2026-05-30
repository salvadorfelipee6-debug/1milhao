import 'server-only'
import { Resend } from 'resend'
import {
  Html, Head, Body, Container, Section, Text,
  Heading, Button, Hr, Preview,
} from '@react-email/components'
import * as React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM   = process.env.RESEND_FROM_EMAIL!

// ─── Template: Boas-vindas ────────────────────────────────
function WelcomeEmail({
  displayName,
  instagramHandle,
  pixelCount,
  niche,
  editUrl,
}: {
  displayName:     string
  instagramHandle: string
  pixelCount:      number
  niche:           string
  editUrl:         string
}) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu espaço no 1 Milhão de Influencer está ativo! 🏆</Preview>
      <Body style={{ background: '#f7f6f3', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto' }}>

          {/* Header */}
          <Section style={{
            background: 'linear-gradient(135deg, #080808 0%, #1a1a1a 100%)',
            borderRadius: '16px 16px 0 0',
            padding: '40px 32px',
            textAlign: 'center',
          }}>
            <Text style={{ color: '#FFD700', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              1 MILHÃO DE INFLUENCER
            </Text>
            <Heading style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px', fontWeight: '800' }}>
              ✅ Seu espaço está ativo!
            </Heading>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
              Bem-vindo ao mapa permanente dos influencers do Brasil
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ background: '#fff', padding: '32px', borderRadius: '0 0 16px 16px' }}>
            <Text style={{ fontSize: '17px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>
              Olá, {displayName}!
            </Text>
            <Text style={{ color: '#666', fontSize: '15px', lineHeight: '1.7' }}>
              Seu bloco de pixels foi ativado e já aparece na grade. Marcas e anunciantes já podem te encontrar.
            </Text>

            {/* Card do bloco */}
            <Section style={{
              background: '#f7f6f3',
              borderRadius: '12px',
              padding: '20px',
              margin: '20px 0',
              borderLeft: '4px solid #E1306C',
            }}>
              <Text style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
                SEU BLOCO
              </Text>
              <Text style={{ fontSize: '22px', fontWeight: '800', color: '#E1306C', margin: '0 0 4px' }}>
                @{instagramHandle}
              </Text>
              <Text style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                {pixelCount.toLocaleString('pt-BR')} pixels · {niche}
              </Text>
            </Section>

            <Button
              href={editUrl}
              style={{
                background: 'linear-gradient(135deg, #E1306C, #833AB4)',
                color: '#fff',
                borderRadius: '10px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: '700',
                display: 'block',
                textAlign: 'center',
                textDecoration: 'none',
                margin: '20px 0',
              }}
            >
              Editar meu perfil →
            </Button>

            <Hr style={{ borderColor: '#f0f0f0', margin: '20px 0' }} />

            <Text style={{ fontSize: '13px', color: '#888', lineHeight: '1.7' }}>
              <strong style={{ color: '#555' }}>💡 Dica:</strong> Adicione um vídeo de apresentação — blocos com vídeo recebem 4× mais cliques de marcas.
            </Text>

            <Hr style={{ borderColor: '#f0f0f0', margin: '20px 0' }} />

            <Text style={{ fontSize: '12px', color: '#bbb', textAlign: 'center' }}>
              Guarde este e-mail. O link de edição é exclusivo para você.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// ─── Template: Proposta de marca ─────────────────────────
function ProposalEmail({
  influencerName,
  brandName,
  campaignType,
  budget,
  message,
  contactEmail,
}: {
  influencerName: string
  brandName:      string
  campaignType:   string
  budget:         string
  message:        string
  contactEmail:   string
}) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>💼 {brandName} quer trabalhar com você!</Preview>
      <Body style={{ background: '#f7f6f3', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
          <Section style={{ background: '#111', padding: '32px', textAlign: 'center' }}>
            <Text style={{ color: '#FFD700', fontSize: '12px', letterSpacing: '2px', margin: '0 0 8px' }}>NOVA PROPOSTA</Text>
            <Heading style={{ color: '#fff', fontSize: '24px', margin: 0 }}>💼 {brandName} quer trabalhar com você</Heading>
          </Section>
          <Section style={{ padding: '32px' }}>
            <Text style={{ color: '#666', fontSize: '15px' }}>Olá, {influencerName}!</Text>
            <Text style={{ color: '#444', fontSize: '15px', lineHeight: '1.7' }}>
              A marca <strong>{brandName}</strong> enviou uma proposta de parceria pelo 1 Milhão de Influencer.
            </Text>
            <Section style={{ background: '#f7f6f3', borderRadius: '10px', padding: '16px', margin: '16px 0' }}>
              <Text style={{ margin: '0 0 6px', fontSize: '13px' }}><strong>Tipo:</strong> {campaignType}</Text>
              <Text style={{ margin: '0 0 6px', fontSize: '13px' }}><strong>Budget:</strong> {budget}</Text>
              <Text style={{ margin: '0 0 6px', fontSize: '13px' }}><strong>Mensagem:</strong></Text>
              <Text style={{ fontSize: '14px', color: '#555', fontStyle: 'italic', margin: 0 }}>"{message}"</Text>
            </Section>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              Responda diretamente para: <a href={`mailto:${contactEmail}`} style={{ color: '#E1306C' }}>{contactEmail}</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── Funções de envio ────────────────────────────────────
export async function sendWelcomeEmail({
  to,
  displayName,
  instagramHandle,
  pixelCount,
  niche,
  editToken,
  blockId,
}: {
  to:              string
  displayName:     string
  instagramHandle: string
  pixelCount:      number
  niche:           string
  editToken:       string
  blockId:         string
}) {
  const editUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meu-painel?token=${editToken}&block=${blockId}`

  await resend.emails.send({
    from:    FROM,
    to:      [to],
    subject: '✅ Seu espaço no 1 Milhão de Influencer está ativo!',
    react:   WelcomeEmail({ displayName, instagramHandle, pixelCount, niche, editUrl }),
  })
}

export async function sendProposalEmail({
  to,
  influencerName,
  brandName,
  campaignType,
  budget,
  message,
  contactEmail,
}: {
  to:             string
  influencerName: string
  brandName:      string
  campaignType:   string
  budget:         string
  message:        string
  contactEmail:   string
}) {
  await resend.emails.send({
    from:    FROM,
    to:      [to],
    subject: `💼 ${brandName} quer trabalhar com você — 1 Milhão de Influencer`,
    react:   ProposalEmail({ influencerName, brandName, campaignType, budget, message, contactEmail }),
  })
}

export async function sendAdminNewSaleEmail({
  instagramHandle,
  pixelCount,
  amountBrl,
  niche,
  soldTotal,
}: {
  instagramHandle: string
  pixelCount:      number
  amountBrl:       number
  niche:           string
  soldTotal:       number
}) {
  const pct = ((soldTotal / 1_000_000) * 100).toFixed(1)
  await resend.emails.send({
    from:    FROM,
    to:      [process.env.RESEND_FROM_EMAIL!],
    subject: `🏆 Nova venda! @${instagramHandle} · R$ ${amountBrl.toFixed(2)}`,
    text: `
Nova venda no 1 Milhão de Influencer!

@${instagramHandle} · ${niche}
${pixelCount.toLocaleString('pt-BR')} pixels
R$ ${amountBrl.toFixed(2)}

Grade: ${soldTotal.toLocaleString('pt-BR')} / 1.000.000 pixels (${pct}%)
    `.trim(),
  })
}
