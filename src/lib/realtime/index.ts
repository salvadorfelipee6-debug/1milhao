import 'server-only'
import Ably from 'ably'
import type { BlockForGrid } from '../db/blocks'

// Cliente Ably no servidor (para publicar eventos)
let serverClient: Ably.Realtime | null = null

function getServerClient() {
  if (!serverClient) {
    serverClient = new Ably.Realtime({
      key:            process.env.ABLY_API_KEY!,
      clientId:       'server',
      autoConnect:    false,
    })
  }
  return serverClient
}

// Canal principal da grade de pixels
const GRID_CHANNEL = '1milhao:grid'

// Publica quando um novo bloco é ativado
// Todos os browsers conectados recebem e renderizam o novo bloco
export async function publishBlockActivated(
  block: BlockForGrid & { id: string; editToken?: string | null }
) {
  const client  = getServerClient()
  const channel = client.channels.get(GRID_CHANNEL)

  await channel.publish('block-activated', {
    id:              block.id,
    instagramHandle: block.instagramHandle,
    displayName:     block.displayName,
    niche:           block.niche,
    colorHex:        block.colorHex,
    avatarUrl:       (block as any).avatarUrl ?? null,
    pixelX:          block.pixelX,
    pixelY:          block.pixelY,
    pixelWidth:      block.pixelWidth,
    pixelHeight:     block.pixelHeight,
    pixelCount:      block.pixelCount,
    editToken:       block.editToken ?? null,
  })
}

// Publica quando um bloco é atualizado (perfil editado)
export async function publishBlockUpdated(blockId: string, patch: Partial<BlockForGrid>) {
  const client  = getServerClient()
  const channel = client.channels.get(GRID_CHANNEL)
  await channel.publish('block:updated', { id: blockId, ...patch })
}

// Gera token de autenticação Ably para o browser
// O browser nunca vê a API key — só o token temporário
export async function createAblyToken(clientId: string) {
  const rest = new Ably.Rest({ key: process.env.ABLY_API_KEY! })
  return rest.auth.createTokenRequest({
    clientId,
    capability: {
      [`${GRID_CHANNEL}`]: ['subscribe'],  // browser só pode ler
    },
    ttl: 60 * 60 * 1000,  // 1 hora
  })
}