import { useMemo, useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { useStore } from '../lib/store'
import { canSeeMetadata } from '../lib/permissions'
import { search } from '../lib/search'
import { useSearchIndex } from '../lib/useIndex'
import { PaperCard } from '../components/PaperBits'
import { Empty, selectCls } from '../components/ui'
import type { PaperStatus } from '../lib/types'

const EXAMPLES = ['leishmaniosis en perros', 'canine vector-borne diseases', 'resistencias antibióticos terneros', 'cólico caballo', 'riñón gatos']

export function SearchPage() {
  const s = useStore()
  const index = useSearchIndex()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'todos' | PaperStatus>('todos')
  const [topic, setTopic] = useState('')

  const visible = useMemo(() => s.papers.filter(p => canSeeMetadata(s, s.currentUserId, p) && (p.status === 'publicado' || p.status === 'en_curso')), [s])

  const results = useMemo(() => {
    const filter = (id: string) => {
      const p = visible.find(x => x.id === id)
      return p && (status === 'todos' || p.status === status) && (!topic || p.topicIds.includes(topic)) ? p : undefined
    }
    if (query.trim()) {
      return search(index, query).map(r => ({ paper: filter(r.paperId), score: r.score })).filter(r => r.paper)
    }
    return visible.filter(p => filter(p.id)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(paper => ({ paper, score: undefined }))
  }, [query, status, topic, visible, index])

  const inProgress = results.filter(r => r.paper!.status === 'en_curso')
  const published = results.filter(r => r.paper!.status === 'publicado')
  const categories = [...new Set(s.topics.map(t => t.category))]

  return (
    <div>
      <div className="mb-7 border border-ink-200 bg-brand-50 px-7 py-6">
        <h1 className="text-[1.6rem] font-black text-brand-900">¿Alguien está trabajando ya en tu tema?</h1>
        <p className="mt-0.5 text-ink-600">Busca entre papers publicados y trabajos en curso de todos los colegios.</p>
        <form className="mt-4 flex" onSubmit={e => e.preventDefault()}>
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-3 text-ink-400" size={19} />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Ej.: leishmaniosis en perros de Andalucía"
              className="w-full rounded-l-[3px] border border-r-0 border-ink-400 bg-white py-2.5 pl-10 pr-4 text-ink-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300" />
          </div>
          <button type="submit" className="rounded-r-[3px] bg-brand-700 px-6 font-bold text-white hover:bg-brand-900">Buscar</button>
        </form>
        <p className="mt-2.5 text-sm text-ink-600">
          Prueba:{' '}
          {EXAMPLES.map((e, i) => (
            <span key={e}>{i > 0 && ' · '}<button type="button" onClick={() => setQuery(e)} className="text-brand-700 underline hover:text-brand-900">{e}</button></span>
          ))}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
        <aside className="space-y-5 text-sm">
          <div>
            <h2 className="mb-2 border-b border-ink-200 pb-1 font-bold">Estado</h2>
            {([['todos', 'Todos'], ['en_curso', 'En curso'], ['publicado', 'Publicados']] as const).map(([v, label]) => (
              <label key={v} className="flex items-center gap-2 py-0.5">
                <input type="radio" name="status" checked={status === v} onChange={() => setStatus(v)} className="accent-brand-700" />{label}
              </label>
            ))}
          </div>
          <div>
            <h2 className="mb-2 border-b border-ink-200 pb-1 font-bold">Tema</h2>
            <select value={topic} onChange={e => setTopic(e.target.value)} className={`${selectCls} w-full`}>
              <option value="">Todos los temas</option>
              {categories.map(c => (
                <optgroup key={c} label={c}>
                  {s.topics.filter(t => t.category === c).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <p className="text-xs leading-relaxed text-ink-500">
            Búsqueda semántica simulada: entiende sinónimos y otros idiomas (perro ≈ canine ≈ dog). En producción: embeddings multilingües + pgvector.
          </p>
        </aside>

        <div>
          <p className="mb-4 text-[15px]"><b>{results.length.toLocaleString('es-ES')}</b> resultados{query.trim() && <> para «{query.trim()}»</>}</p>
          {results.length === 0 && <Empty>No hay resultados. Prueba con otros términos.</Empty>}

          {inProgress.length > 0 && (
            <section className="mb-8">
              <h2 className="border-b-2 border-amber-500 pb-1.5 text-lg font-bold">Trabajos en curso <span className="font-normal text-ink-500">({inProgress.length})</span></h2>
              <div>{inProgress.map(r => <PaperCard key={r.paper!.id} paper={r.paper!} score={r.score} />)}</div>
            </section>
          )}
          {published.length > 0 && (
            <section>
              <h2 className="border-b-2 border-brand-700 pb-1.5 text-lg font-bold">Papers publicados <span className="font-normal text-ink-500">({published.length})</span></h2>
              <div>{published.map(r => <PaperCard key={r.paper!.id} paper={r.paper!} score={r.score} />)}</div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
