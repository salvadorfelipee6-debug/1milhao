// ─── Preço ────────────────────────────────────────────────
// Fonte única do preço por pixel — usado no grid, hero, form e checkout
export const PIXEL_PRICE = 0.99

// ─── Grade de pixels ──────────────────────────────────────

export interface GridBlock {
  id:              string
  instagramHandle: string
  displayName:     string
  niche:           string
  city:            string | null
  followers:       string | null
  bio:             string | null
  videoUrl:        string | null
  websiteUrl:      string | null
  avatarUrl:       string | null
  colorHex:        string
  pixelX:          number
  pixelY:          number
  pixelWidth:      number
  pixelHeight:     number
  pixelCount:      number
  // Redes sociais
  whatsappUrl?:    string | null
  youtubeUrl?:     string | null
  tiktokUrl?:      string | null
  twitterUrl?:     string | null
  facebookUrl?:    string | null
  kwaiUrl?:        string | null
  onlyfansUrl?:    string | null
  spotifyUrl?:     string | null
  // Links personalizados
  customLinks?:    CustomLink[] | null
  editToken?:      string | null
}

export interface CustomLink {
  label: string
  url:   string
  emoji?: string
}

export interface GridStats {
  total:     number
  sold:      number
  available: number
  active:    number
  percent:   number
}

// ─── Formulário de cadastro ───────────────────────────────

export interface RegisterFormData {
  instagramHandle: string
  displayName:     string
  niche:           Niche
  city?:           string
  followers?:      string
  bio?:            string
  videoUrl?:       string
  websiteUrl?:     string
  avatarUrl?:      string
  email:           string
  pixelCount:      number
  paymentProvider: 'stripe' | 'mercadopago'
  whatsappUrl?:    string
  youtubeUrl?:     string
  tiktokUrl?:      string
  twitterUrl?:     string
  facebookUrl?:    string
  kwaiUrl?:        string
  onlyfansUrl?:    string
  spotifyUrl?:     string
  customLinks?:    CustomLink[]
}

// ─── Nichos ───────────────────────────────────────────────

export type Niche =
  | 'fitness'
  | 'moda'
  | 'tecnologia'
  | 'gastronomia'
  | 'beleza'
  | 'viagens'
  | 'games'
  | 'financas'
  | 'familia'
  | 'humor'
  | 'educacao'
  | 'outros'

export const NICHE_LABELS: Record<Niche, string> = {
  fitness:     'Fitness & Saúde',
  moda:        'Moda & Estilo',
  tecnologia:  'Tecnologia',
  gastronomia: 'Gastronomia',
  beleza:      'Beleza & Cuidados',
  viagens:     'Viagens',
  games:       'Games',
  financas:    'Finanças',
  familia:     'Família',
  humor:       'Humor',
  educacao:    'Educação',
  outros:      'Outros',
}

export const NICHE_EMOJI: Record<Niche, string> = {
  fitness:     '💪',
  moda:        '👗',
  tecnologia:  '💻',
  gastronomia: '🍔',
  beleza:      '💄',
  viagens:     '✈️',
  games:       '🎮',
  financas:    '💰',
  familia:     '👨‍👩‍👧',
  humor:       '😂',
  educacao:    '📚',
  outros:      '✨',
}

export const NICHE_COLORS: Record<Niche, string> = {
  fitness:     '#E1306C',
  moda:        '#C13584',
  tecnologia:  '#405DE6',
  gastronomia: '#F77737',
  beleza:      '#833AB4',
  viagens:     '#5851DB',
  games:       '#405DE6',
  financas:    '#0095F6',
  familia:     '#E1306C',
  humor:       '#FCAF45',
  educacao:    '#0095F6',
  outros:      '#888888',
}

// ─── Eventos WebSocket (Ably) ─────────────────────────────

export type RealtimeEvent =
  | { type: 'block:activated'; data: GridBlock }
  | { type: 'block:updated';   data: Partial<GridBlock> & { id: string } }

// ─── Analytics ────────────────────────────────────────────

export type AnalyticsEventType =
  | 'view'
  | 'popup_open'
  | 'ig_click'
  | 'advertise_click'
  | 'video_play'

// ─── Badges de gamificação ────────────────────────────────

export interface Badge {
  key:   string
  label: string
  desc:  string
  color: string
  icon:  string
}

// ─── API responses ────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true
  data:    T
}

export interface ApiError {
  success: false
  error:   string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError