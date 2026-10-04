import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Undo2 } from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import { canReview } from '../lib/permissions'
import { fmtDateTime, fmtRelative, fullName, VISIBILITY_LABEL } from '../lib/format'
import { Button, Callout, Card, Empty, inputCls, PageHeader } from '../components/ui'
import { PdfViewer } from '../components/PdfViewer'

export function ReviewPage() {
  const s = useStore()
  const me = useMe()
  const queue = s.papers.filter(p => p.status === 'en_revision' && canReview(s, me.id, p))
  const [selectedId, setSelectedId] = useState<string>()
  const [comment, setComment] = useState('')
  const selected = queue.find(p => p.id === selectedId) ?? queue[0]

  return (
    <div>
      <PageHeader title="Cola de revisión" subtitle="Los papers no se publican hasta que un admin local del grupo propietario (o un admin global) los aprueba." />
      {queue.length === 0 ? <Empty>No hay papers pendientes de revisión. ¡Todo al día!</Empty> : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-2">
            {queue.map(p => (
              <button key={p.id} onClick={() => { setSelectedId(p.id); setComment('') }}
                className={`block w-full rounded border p-3 text-left text-sm ${selected?.id === p.id ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'}`}>
                <p className="font-bold text-ink-900">{p.title}</p>
                <p className="mt-1 text-xs text-ink-500">{p.authorIds.map(id => fullName(s.users.find(u => u.id === id))).join(', ')} · enviado {fmtRelative(p.updatedAt)}</p>
                <p className="text-xs text-ink-500">{s.groups.find(g => g.id === p.ownerGroupId)?.name}</p>
              </button>
            ))}
          </div>
          {selected && (
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <Link to={`/papers/${selected.id}`} className="font-serif text-lg font-bold text-brand-700 hover:underline">{selected.title}</Link>
                <p className="mt-2 text-sm text-ink-600">{selected.abstract}</p>
                <p className="mt-2 text-xs text-ink-500">
                  Visibilidad al publicar: {VISIBILITY_LABEL[selected.visibility]} · Descarga: {selected.allowDownload ? 'permitida' : 'no'} · Versión {selected.versions.length}
                </p>
                <div className="mt-3"><Callout>El autor ya ha sido avisado de que su paper se está procesando.</Callout></div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} className={`${inputCls} mt-4`}
                  placeholder="Comentarios para el autor (obligatorio si lo devuelves)" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={() => { s.approvePaper(selected.id); setSelectedId(undefined) }}><CheckCircle2 size={16} />Aprobar y publicar</Button>
                  <Button variant="danger" disabled={comment.trim().length < 5} onClick={() => { s.returnPaper(selected.id, comment.trim()); setSelectedId(undefined); setComment('') }}>
                    <Undo2 size={16} />Devolver con comentarios
                  </Button>
                </div>
              </Card>
              {selected.versions.at(-1) && (
                <PdfViewer version={selected.versions.at(-1)!} watermark={`REVISIÓN · ${fullName(me)} · ${fmtDateTime(new Date().toISOString())}`} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
