import { Link } from 'react-router-dom'
import { CalendarClock, Eye, FlaskConical, Globe, Lock, Unlock, Users } from 'lucide-react'
import { Badge, type BadgeColor } from './ui'
import { useStore } from '../lib/store'
import { canRead } from '../lib/permissions'
import { fmtDate, fullName, STATUS_LABEL, VISIBILITY_LABEL } from '../lib/format'
import type { Paper, PaperStatus, Visibility } from '../lib/types'

const STATUS_COLOR: Record<PaperStatus, BadgeColor> = {
  en_curso: 'amber', en_revision: 'violet', devuelto: 'red', publicado: 'green', retirado: 'slate',
}

export function StatusBadge({ status }: { status: PaperStatus }) {
  return <Badge color={STATUS_COLOR[status]}>{status === 'en_curso' && <FlaskConical size={12} />}{STATUS_LABEL[status]}</Badge>
}

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const Icon = visibility === 'publica' ? Globe : visibility === 'grupos' ? Users : Lock
  return <Badge color="slate"><Icon size={12} />{VISIBILITY_LABEL[visibility]}</Badge>
}

export function AccessHint({ paper }: { paper: Paper }) {
  const s = useStore()
  if (paper.status !== 'publicado') return null
  return canRead(s, s.currentUserId, paper)
    ? <span className="inline-flex items-center gap-1 text-xs text-cite"><Unlock size={12} />Tienes acceso</span>
    : <span className="inline-flex items-center gap-1 text-xs text-red-800"><Lock size={12} />Requiere solicitud</span>
}

/** Result-list entry in the PubMed style: link-blue title, authors, green source line, snippet. */
export function PaperCard({ paper, score, compact = false }: { paper: Paper; score?: number; compact?: boolean }) {
  const s = useStore()
  const authors = paper.authorIds.map(id => s.users.find(u => u.id === id))
  const group = s.groups.find(g => g.id === paper.ownerGroupId)
  const topics = paper.topicIds.map(id => s.topics.find(t => t.id === id)).filter(Boolean)
  const views = s.events.filter(e => e.paperId === paper.id && e.type === 'view').length

  return (
    <Link to={`/papers/${paper.id}`} className={`group block border-b border-ink-200 last:border-b-0 ${compact ? 'py-3' : 'py-4'}`}>
      <h3 className={`font-serif font-bold leading-snug text-brand-700 group-hover:underline ${compact ? 'text-sm' : 'text-[17px]'}`}>{paper.title}</h3>
      <p className="mt-1 text-sm text-ink-800">
        {paper.external ? <>{paper.external.authors} <span className="text-ink-500">· subido por {fullName(authors[0])}</span></>
          : authors.map(fullName).join(', ')}
      </p>
      <p className="text-sm text-cite">
        {paper.external ? <>{paper.external.journal} · Open access {paper.external.license}</> : group?.name}
        {paper.status === 'publicado' && paper.publishedAt && <> · {fmtDate(paper.publishedAt)}</>}
        {paper.language !== 'es' && <> · {paper.language.toUpperCase()}</>}
      </p>
      {!compact && <p className="mt-1.5 line-clamp-2 text-sm text-ink-600">{paper.abstract}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
        <StatusBadge status={paper.status} />
        {!compact && <VisibilityBadge visibility={paper.visibility} />}
        <AccessHint paper={paper} />
        {!compact && topics.length > 0 && <span>{topics.map(t => t!.name).join(' · ')}</span>}
        {paper.status === 'en_curso' && paper.estimatedDate && (
          <span className="flex items-center gap-1"><CalendarClock size={12} />Publicación estimada: {fmtDate(paper.estimatedDate)}</span>
        )}
        {paper.status === 'publicado' && <span className="flex items-center gap-1"><Eye size={12} />{views}</span>}
        {score !== undefined && (
          <span className="ml-auto flex items-center gap-1.5" title="Relevancia de la búsqueda semántica">
            Relevancia
            <span className="h-1 w-14 bg-ink-200">
              <span className="block h-full bg-brand-500" style={{ width: `${Math.min(100, Math.round(score * 140))}%` }} />
            </span>
          </span>
        )}
      </div>
    </Link>
  )
}
