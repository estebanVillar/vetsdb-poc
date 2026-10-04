import { useDeferredValue, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, MessageSquare, Radar } from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import { canSeeMetadata, writerGroupIds } from '../lib/permissions'
import { similarToText } from '../lib/search'
import { useSearchIndex } from '../lib/useIndex'
import { fullName } from '../lib/format'
import type { Paper, Visibility } from '../lib/types'
import { Button, Card, Field, inputCls, PageHeader } from '../components/ui'
import { StatusBadge } from '../components/PaperBits'

function OverlapPanel({ text }: { text: string }) {
  const s = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const index = useSearchIndex()
  const deferred = useDeferredValue(text)
  const matches = useMemo(() => deferred.trim().length < 8 ? [] :
    similarToText(index, deferred, undefined, 0.1)
      .map(r => ({ paper: s.papers.find(p => p.id === r.paperId)!, score: r.score }))
      .filter(r => canSeeMetadata(s, me.id, r.paper) && (r.paper.status === 'en_curso' || r.paper.status === 'publicado') && !r.paper.authorIds.includes(me.id))
      .slice(0, 5), [deferred, index, s, me.id])

  const ongoing = matches.filter(m => m.paper.status === 'en_curso')

  return (
    <Card className="sticky top-20">
      <h2 className="mb-1 flex items-center gap-2 font-bold"><Radar size={18} className="text-brand-700" />Detector de solapes</h2>
      <p className="mb-3 text-xs text-ink-500">Mientras escribes, buscamos trabajos parecidos para que no dupliques esfuerzos.</p>
      {deferred.trim().length < 8 && <p className="text-sm text-ink-400">Escribe el título o el resumen…</p>}
      {deferred.trim().length >= 8 && matches.length === 0 && <p className="text-sm text-brand-700">No hemos encontrado trabajos similares. ¡Adelante!</p>}
      {ongoing.length > 0 && (
        <div className="mb-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="flex items-center gap-1.5 font-bold"><AlertTriangle size={16} />Alguien ya está trabajando en algo parecido</p>
        </div>
      )}
      <ul className="space-y-2">
        {matches.map(({ paper, score }) => {
          const author = s.users.find(u => u.id === paper.authorIds[0])
          const group = s.groups.find(g => g.id === paper.ownerGroupId)
          return (
            <li key={paper.id} className={`rounded border p-3 text-sm ${paper.status === 'en_curso' ? 'border-amber-200' : 'border-ink-200'}`}>
              <div className="mb-1 flex items-center gap-2"><StatusBadge status={paper.status} /><span className="text-xs text-ink-400">similitud {Math.round(score * 100)}%</span></div>
              <Link to={`/papers/${paper.id}`} className="font-bold text-brand-700 hover:underline">{paper.title}</Link>
              <p className="text-xs text-ink-500">{fullName(author)} · {group?.name}</p>
              {paper.status === 'en_curso' && author && (
                <Button variant="secondary" size="sm" className="mt-2" onClick={() => navigate(`/chat?c=${s.openConversation(author.id, { paperId: paper.id })}`)}>
                  <MessageSquare size={13} />Contactar con {author.firstName}
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export function PaperForm() {
  const s = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const myGroups = writerGroupIds(s, me.id)
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [language, setLanguage] = useState<Paper['language']>('es')
  const [topicIds, setTopicIds] = useState<string[]>([])
  const [keywords, setKeywords] = useState('')
  const [coauthors, setCoauthors] = useState<string[]>([])
  const [ownerGroupId, setOwnerGroupId] = useState(myGroups[0] ?? s.groups[0].id)
  const [visibility, setVisibility] = useState<Visibility>('publica')
  const [visibleGroupIds, setVisibleGroupIds] = useState<string[]>([])
  const [allowDownload, setAllowDownload] = useState(false)
  const [estimatedDate, setEstimatedDate] = useState('')

  const categories = [...new Set(s.topics.map(t => t.category))]
  const writers = s.users.filter(u => u.id !== me.id && s.memberships.some(m => m.userId === u.id && m.status === 'active' && m.role !== 'reader'))
    .sort((a, b) => fullName(a).localeCompare(fullName(b)))
  const toggle = (list: string[], v: string) => list.includes(v) ? list.filter(x => x !== v) : [...list, v]

  const submit = () => {
    const id = s.createPaper({
      title: title.trim(), abstract: abstract.trim(), language, topicIds,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      authorIds: [me.id, ...coauthors], ownerGroupId, visibility, visibleGroupIds, allowDownload,
      estimatedDate: estimatedDate ? new Date(estimatedDate).toISOString() : undefined,
    })
    navigate(`/papers/${id}`)
  }

  return (
    <div>
      <PageHeader title="Nuevo paper" subtitle="Se crea como «En curso»: los demás verán que estás trabajando en este tema. Cuando termines, sube el PDF para revisión." />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-2">
          <Field label="Título"><input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Ej.: Leishmaniosis canina en la Comunidad de Madrid" /></Field>
          <Field label="Resumen"><textarea value={abstract} onChange={e => setAbstract(e.target.value)} rows={4} className={inputCls} placeholder="Objetivo, población, métodos previstos…" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Idioma">
              <select value={language} onChange={e => setLanguage(e.target.value as Paper['language'])} className={inputCls}>
                <option value="es">Español</option><option value="ca">Catalán</option><option value="eu">Euskera</option><option value="gl">Gallego</option><option value="en">Inglés</option>
              </select>
            </Field>
            <Field label="Publicación estimada"><input type="date" value={estimatedDate} onChange={e => setEstimatedDate(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Temas (catálogo)">
            <div className="grid gap-x-4 gap-y-1 rounded border border-ink-200 p-3 sm:grid-cols-2">
              {categories.map(c => (
                <div key={c} className="text-sm">
                  <p className="font-bold text-ink-500">{c}</p>
                  {s.topics.filter(t => t.category === c).map(t => (
                    <label key={t.id} className="ml-2 flex items-center gap-1.5">
                      <input type="checkbox" checked={topicIds.includes(t.id)} onChange={() => setTopicIds(toggle(topicIds, t.id))} />{t.name}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </Field>
          <Field label="Palabras clave" hint="Separadas por comas"><input value={keywords} onChange={e => setKeywords(e.target.value)} className={inputCls} placeholder="leishmaniosis, perro, Madrid" /></Field>
          <Field label="Co-autores (usuarios de la plataforma)">
            <select multiple value={coauthors} onChange={e => setCoauthors([...e.target.selectedOptions].map(o => o.value))} className={`${inputCls} h-28`}>
              {writers.map(u => <option key={u.id} value={u.id}>{fullName(u)}</option>)}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Grupo propietario" hint="Su admin local revisará y gestionará el paper">
              <select value={ownerGroupId} onChange={e => setOwnerGroupId(e.target.value)} className={inputCls}>
                {(myGroups.length ? myGroups : s.groups.map(g => g.id)).map(id => <option key={id} value={id}>{s.groups.find(g => g.id === id)?.name}</option>)}
              </select>
            </Field>
            <Field label="Visibilidad al publicarse">
              <select value={visibility} onChange={e => setVisibility(e.target.value as Visibility)} className={inputCls}>
                <option value="publica">Pública (usuarios registrados)</option>
                <option value="grupos">Solo ciertos grupos</option>
                <option value="privada">Privada (bajo solicitud)</option>
              </select>
            </Field>
          </div>
          {visibility === 'grupos' && (
            <div className="flex flex-wrap gap-3 text-sm">
              {s.groups.map(g => (
                <label key={g.id} className="flex items-center gap-1.5">
                  <input type="checkbox" checked={visibleGroupIds.includes(g.id)} onChange={() => setVisibleGroupIds(toggle(visibleGroupIds, g.id))} />{g.name}
                </label>
              ))}
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={allowDownload} onChange={e => setAllowDownload(e.target.checked)} />
            Permitir descarga (siempre con marca de agua del lector)
          </label>
          <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button disabled={title.trim().length < 5 || topicIds.length === 0} onClick={submit}>Crear como «En curso»</Button>
          </div>
        </Card>
        <OverlapPanel text={`${title} ${title} ${abstract} ${keywords}`} />
      </div>
    </div>
  )
}
