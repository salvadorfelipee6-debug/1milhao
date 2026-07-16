// Lista de cidades brasileiras (IBGE) — carregada uma vez no client e cacheada
// em memória para alimentar o autocomplete de cidade (cadastro + painel).
// Mantém o valor final sempre no formato "Cidade, UF", padronizando o que
// antes era texto livre (ex: "florianopolis" virava "sao paulo" sem acento,
// cada um de um jeito).

export interface City {
  nome: string
  uf:   string
}

let cache: City[] | null = null
let inflight: Promise<City[]> | null = null

function normalize(s: string): string {
  return s.normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]', 'g'), '').toLowerCase()
}

export async function loadCities(): Promise<City[]> {
  if (cache) return cache
  if (inflight) return inflight

  inflight = fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
    .then(res => {
      if (!res.ok) throw new Error('IBGE indisponível')
      return res.json()
    })
    .then((raw: any[]) => {
      const list: City[] = raw
        .map(m => ({
          nome: m?.nome as string,
          uf:   m?.microrregiao?.mesorregiao?.UF?.sigla as string,
        }))
        .filter(c => c.nome && c.uf)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      cache = list
      return list
    })
    .catch(() => {
      cache = []
      return []
    })
    .finally(() => { inflight = null })

  return inflight
}

export function searchCities(all: City[], query: string, limit = 8): City[] {
  const q = normalize(query.trim())
  if (!q) return []

  const startsWith: City[] = []
  const contains:   City[] = []
  for (const c of all) {
    const n = normalize(c.nome)
    if (n.startsWith(q)) startsWith.push(c)
    else if (n.includes(q)) contains.push(c)
    if (startsWith.length >= limit) break
  }
  return [...startsWith, ...contains].slice(0, limit)
}
