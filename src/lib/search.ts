import type { Paper, Topic, User } from './types'

// Sinónimos ES/EN/CA para simular la búsqueda semántica (en producción: embeddings + pgvector).
const CONCEPTS: [RegExp, string][] = [
  [/^(perr|canin|dog|canine|cachorr|gos$|gossos$)/, 'perro'],
  [/^(gat[oa]s?$|felin|cat$|cats$|feline)/, 'gato'],
  [/^(caball|equin|equid|yegu|horse|potr|cavall)/, 'caballo'],
  [/^(leishmani|leish$|canl$)/, 'leishmania'],
  [/^(flebotom|sandfl|phlebotom)/, 'flebotomo'],
  [/^(vacuno|vacunos|bovin|terner|cattle|calf|calves|vaca$|vacas$)/, 'vacuno'],
  [/^(vacuna|vacunac|vaccin)/, 'vacuna'],
  [/^(ovin|oveja|corder|sheep|lamb)/, 'ovino'],
  [/^(ave$|aves$|aviar|avicol|gallin|pollo|poultry|hens?$|chicken)/, 'ave'],
  [/^(renal|rinon|kidney|nefr)/, 'renal'],
  [/^(antibiot|antimicrob|resistenc)/, 'antimicrobiano'],
  [/^(parasit)/, 'parasito'],
  [/^(vector|mosquit|garrapat|ticks?$)/, 'vector'],
  [/^(zoono)/, 'zoonosis'],
  [/^(obes|sobrepes|overweight)/, 'obesidad'],
  [/^(diagnos)/, 'diagnostico'],
  [/^(tratamient|treatment|therap|terap)/, 'tratamiento'],
  [/^(prevalen|seroprevalen)/, 'prevalencia'],
  [/^(espan|spain|spanish)/, 'espana'],
  [/^(salmonel)/, 'salmonella'],
  [/^(colic)/, 'colico'],
  [/^(bienestar|welfare)/, 'bienestar'],
  [/^(transport)/, 'transporte'],
  [/^(dirofilar|heartworm)/, 'dirofilaria'],
  [/^(telemedic|teleconsult|telehealth)/, 'telemedicina'],
  [/^(guia|guidelin|protocol|manejo|management)/, 'protocolo'],
]

const STOP = new Set(('de la el en y a los las del un una por con para su sus al lo se que es como mas o e ' +
  'the of and in to a for on with from by an is are at as its their our this that be or ' +
  'sobre entre sin tras desde durante estudio study based using').split(' '))

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function toTerm(word: string): string | null {
  if (word.length < 3 || STOP.has(word)) return null
  for (const [re, concept] of CONCEPTS) if (re.test(word)) return concept
  let w = word
  if (w.length > 5 && w.endsWith('es')) w = w.slice(0, -2)
  else if (w.length > 4 && w.endsWith('s')) w = w.slice(0, -1)
  return w.slice(0, 8)
}

export function terms(text: string): string[] {
  return normalize(text).split(' ').map(toTerm).filter((t): t is string => !!t)
}

type Vec = Map<string, number>

function addWeighted(vec: Vec, text: string, weight: number) {
  for (const t of terms(text)) vec.set(t, (vec.get(t) ?? 0) + weight)
}

export interface SearchIndex {
  vectors: Map<string, Vec>
  idf: Map<string, number>
}

export function paperText(paper: Paper, topics: Topic[], users: User[]) {
  const topicNames = paper.topicIds.map(id => topics.find(t => t.id === id)).filter(Boolean)
    .map(t => `${t!.category} ${t!.name}`).join(' ')
  const authors = paper.authorIds.map(id => users.find(u => u.id === id)).filter(Boolean)
    .map(u => `${u!.firstName} ${u!.lastName}`).join(' ')
  return { title: paper.title, abstract: paper.abstract, keywords: paper.keywords.join(' '), topics: topicNames,
    authors: `${authors} ${paper.external?.authors ?? ''}` }
}

function rawVector(parts: ReturnType<typeof paperText>): Vec {
  const v: Vec = new Map()
  addWeighted(v, parts.title, 3)
  addWeighted(v, parts.keywords, 2)
  addWeighted(v, parts.topics, 1.5)
  addWeighted(v, parts.abstract, 1)
  addWeighted(v, parts.authors, 1)
  return v
}

function weigh(raw: Vec, idf: Map<string, number>): Vec {
  const v: Vec = new Map()
  let norm = 0
  for (const [t, tf] of raw) {
    const w = (1 + Math.log(tf)) * (idf.get(t) ?? 1)
    v.set(t, w)
    norm += w * w
  }
  norm = Math.sqrt(norm) || 1
  for (const [t, w] of v) v.set(t, w / norm)
  return v
}

function cosine(a: Vec, b: Vec): number {
  let s = 0
  const [small, big] = a.size < b.size ? [a, b] : [b, a]
  for (const [t, w] of small) s += w * (big.get(t) ?? 0)
  return s
}

export function buildIndex(papers: Paper[], topics: Topic[], users: User[]): SearchIndex {
  const raws = new Map(papers.map(p => [p.id, rawVector(paperText(p, topics, users))]))
  const df = new Map<string, number>()
  for (const v of raws.values()) for (const t of v.keys()) df.set(t, (df.get(t) ?? 0) + 1)
  const idf = new Map<string, number>()
  for (const [t, n] of df) idf.set(t, Math.log(1 + papers.length / n))
  const vectors = new Map<string, Vec>()
  for (const [id, raw] of raws) vectors.set(id, weigh(raw, idf))
  return { vectors, idf }
}

export interface Scored { paperId: string; score: number }

export function search(index: SearchIndex, query: string): Scored[] {
  const raw: Vec = new Map()
  addWeighted(raw, query, 1)
  if (raw.size === 0) return []
  const q = weigh(raw, index.idf)
  const out: Scored[] = []
  for (const [paperId, v] of index.vectors) {
    const score = cosine(q, v)
    if (score > 0.03) out.push({ paperId, score })
  }
  return out.sort((a, b) => b.score - a.score)
}

export function similarToText(index: SearchIndex, text: string, excludeId?: string, min = 0.12): Scored[] {
  return search(index, text).filter(s => s.paperId !== excludeId && s.score >= min)
}

export function similarToPaper(index: SearchIndex, paperId: string, min = 0.12): Scored[] {
  const v = index.vectors.get(paperId)
  if (!v) return []
  const out: Scored[] = []
  for (const [id, other] of index.vectors) {
    if (id === paperId) continue
    const score = cosine(v, other)
    if (score >= min) out.push({ paperId: id, score })
  }
  return out.sort((a, b) => b.score - a.score)
}
