import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, BookOpenCheck, CalendarClock, Download, ExternalLink, FlaskConical, Lock, Mail, MessageSquare, Phone, Send, Upload,
} from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import {
  activeGrant, activeMemberships, canDownload, canManagePaper, canRead, canRequestAccess, canReview, canSeeMetadata, isAuthor,
  pendingRequest, readAccessReason,
} from '../lib/permissions'
import { downloadWithWatermark, storeUpload } from '../lib/pdf'
import { similarToPaper } from '../lib/search'
import { useSearchIndex } from '../lib/useIndex'
import { fmtDate, fmtDateTime, fullName, LANGUAGE_LABEL } from '../lib/format'
import type { Paper, User, Visibility } from '../lib/types'
import { Avatar, Badge, Button, Callout, Card, inputCls } from '../components/ui'
import { PaperCard, StatusBadge, VisibilityBadge } from '../components/PaperBits'
import { PdfViewer } from '../components/PdfViewer'

function AuthorContact({ user, paperId }: { user: User; paperId: string }) {
  const s = useStore()
  const navigate = useNavigate()
  const groups = activeMemberships(s, user.id).map(m => s.groups.find(g => g.id === m.groupId)?.name).filter(Boolean)
  return (
    <div className="flex items-start gap-3 border-t border-ink-100 pt-3 first:border-t-0 first:pt-0">
      <Avatar user={user} size={40} />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-bold text-ink-900">{fullName(user)}</p>
        <p className="text-xs text-ink-500">{groups.join(' · ')}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-600">
          {user.showEmail ? <span className="flex items-center gap-1"><Mail size={12} />{user.email}</span>
            : <span className="text-ink-400">Email oculto por el autor</span>}
          {user.showPhone && user.phone && <span className="flex items-center gap-1"><Phone size={12} />{user.phone}</span>}
        </div>
        {user.id !== s.currentUserId && (
          <Button variant="secondary" size="sm" className="mt-2" onClick={() => navigate(`/chat?c=${s.openConversation(user.id, { paperId })}`)}>
            <MessageSquare size={14} />Enviar mensaje
          </Button>
        )}
      </div>
    </div>
  )
}

function RequestForm({ paper }: { paper: Paper }) {
  const s = useStore()
  const [msg, setMsg] = useState('')
  const lastDenied = s.requests.find(r => r.paperId === paper.id && r.requesterId === s.currentUserId && r.status === 'denegada')
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm text-ink-700"><Lock size={16} className="text-red-800" />
        {paper.visibility === 'privada' ? 'Este paper es privado.' : 'Este paper solo es visible para miembros de ciertos grupos.'} Puedes solicitar acceso a los autores.
      </p>
      {lastDenied && <Callout tone="warn">Tu solicitud anterior fue denegada: «{lastDenied.responseMessage}»</Callout>}
      <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} className={`${inputCls} mt-2`}
        placeholder="Explica por qué necesitas acceder (p. ej. proyecto, charla, tesis…)" />
      <Button className="mt-2" disabled={msg.trim().length < 10} onClick={() => s.requestAccess(paper.id, msg.trim())}>
        <Send size={14} />Solicitar acceso
      </Button>
    </div>
  )
}

function ManagePanel({ paper }: { paper: Paper }) {
  const s = useStore()
  const me = useMe()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const reviewer = canReview(s, me.id, paper) && !isAuthor(paper, me.id)

  const upload = async (file: File) => {
    setBusy(true)
    const blobKey = await storeUpload(file)
    s.submitForReview(paper.id, { blobKey, fileName: file.name, uploadedAt: new Date().toISOString() })
    setBusy(false)
  }

  return (
    <Card>
      <h2 className="mb-3 font-bold">Gestión {reviewer && <Badge color="violet">como admin: control total</Badge>}</h2>
      {paper.status === 'devuelto' && paper.reviewComment && (
        <div className="mb-3"><Callout tone="warn"><b>Comentario del revisor:</b> {paper.reviewComment}</Callout></div>
      )}
      {paper.status === 'en_revision' && (
        <div className="mb-3"><Callout>El paper se está procesando: está en revisión por el admin del grupo propietario. {canReview(s, me.id, paper) && <Link to="/revision" className="font-bold underline">Ir a la cola de revisión</Link>}</Callout></div>
      )}
      {(paper.status === 'en_curso' || paper.status === 'devuelto') && (
        <div className="mb-4 rounded bg-ink-50 p-3">
          <p className="mb-2 text-sm text-ink-700">¿Has terminado? Sube el PDF y se enviará a revisión antes de publicarse.</p>
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => fileRef.current?.click()}><Upload size={14} />Subir PDF y enviar a revisión</Button>
            <Button variant="secondary" disabled={busy} onClick={() => s.submitForReview(paper.id, { fileUrl: `${import.meta.env.BASE_URL}docs/demo-telemedicina-rural.pdf`, fileName: 'documento-ejemplo.pdf', uploadedAt: new Date().toISOString() })}>
              Usar PDF de ejemplo
            </Button>
          </div>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-bold text-ink-700">Visibilidad</span>
          <select value={paper.visibility} onChange={e => s.updatePaper(paper.id, { visibility: e.target.value as Visibility })} className={inputCls}>
            <option value="publica">Pública (usuarios registrados)</option>
            <option value="grupos">Solo ciertos grupos</option>
            <option value="privada">Privada (bajo solicitud)</option>
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" checked={paper.allowDownload} onChange={e => s.updatePaper(paper.id, { allowDownload: e.target.checked })} />
          Permitir descarga (con marca de agua)
        </label>
      </div>
      {paper.visibility === 'grupos' && (
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {s.groups.map(g => (
            <label key={g.id} className="flex items-center gap-1.5">
              <input type="checkbox" checked={paper.visibleGroupIds.includes(g.id)} onChange={e => s.updatePaper(paper.id, {
                visibleGroupIds: e.target.checked ? [...paper.visibleGroupIds, g.id] : paper.visibleGroupIds.filter(x => x !== g.id),
              })} />{g.name}
            </label>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
        <Link to="/estadisticas"><Button variant="secondary" size="sm">Ver estadísticas</Button></Link>
        {paper.status !== 'retirado' && (
          <Button variant="danger" size="sm" onClick={() => confirm('¿Retirar este paper? Dejará de ser visible para los demás.') && s.withdrawPaper(paper.id)}>
            Retirar paper
          </Button>
        )}
      </div>
    </Card>
  )
}

export function PaperDetail() {
  const { id } = useParams()
  const s = useStore()
  const me = useMe()
  const index = useSearchIndex()
  const [showViewer, setShowViewer] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const paper = s.papers.find(p => p.id === id)

  const similar = useMemo(() => paper
    ? similarToPaper(index, paper.id).map(r => s.papers.find(p => p.id === r.paperId)!)
      .filter(p => canSeeMetadata(s, me.id, p) && (p.status === 'publicado' || p.status === 'en_curso')).slice(0, 4)
    : [], [index, paper, s, me.id])

  if (!paper || !canSeeMetadata(s, me.id, paper)) {
    return <Callout tone="warn">Este paper no existe o no tienes permiso para verlo.</Callout>
  }

  const authors = paper.authorIds.map(aid => s.users.find(u => u.id === aid)!).filter(Boolean)
  const topics = paper.topicIds.map(tid => s.topics.find(t => t.id === tid)).filter(Boolean)
  const version = paper.versions.at(-1)
  const reason = readAccessReason(s, me.id, paper)
  const grant = activeGrant(s, me.id, paper.id)
  const pending = pendingRequest(s, me.id, paper.id)
  const watermark = `${fullName(me)} · ${me.email} · ${fmtDateTime(new Date().toISOString())}`

  const openViewer = () => { setShowViewer(true); s.logEvent(paper.id, 'view') }
  const download = async () => {
    if (!version) return
    setDownloading(true)
    try {
      await downloadWithWatermark(version, `${fullName(me)} · ${me.email} · ${new Date().toLocaleString('es-ES')}`, version.fileName)
      s.logEvent(paper.id, 'download')
    } finally { setDownloading(false) }
  }

  return (
    <div className="space-y-5">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:text-brand-900 hover:underline"><ArrowLeft size={14} />Volver al buscador</Link>

      <article className="border-b border-ink-200 pb-6">
        <p className="text-sm text-cite">
          {s.groups.find(g => g.id === paper.ownerGroupId)?.name}
          {paper.publishedAt && <> · Publicado el {fmtDate(paper.publishedAt)}</>}
          {paper.status === 'en_curso' && paper.estimatedDate && <> · <CalendarClock size={13} className="inline" /> Publicación estimada: {fmtDate(paper.estimatedDate)}</>}
        </p>
        <h1 className="mt-2 font-serif text-[1.65rem] font-bold leading-snug text-ink-900">{paper.title}</h1>
        <p className="mt-2 text-[15px] text-brand-700">{paper.external ? paper.external.authors : authors.map(fullName).join(', ')}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={paper.status} />
          <VisibilityBadge visibility={paper.visibility} />
          <Badge>{LANGUAGE_LABEL[paper.language]}</Badge>
          {paper.versions.length > 0 && <Badge>v{paper.versions.length}</Badge>}
        </div>
        {paper.external && (
          <div className="mt-4"><Callout>
            <p className="font-bold">Fuente externa de acceso abierto · Licencia {paper.external.license}</p>
            <p>{paper.external.journal} · <a className="inline-flex items-center gap-1 text-brand-700 underline hover:text-brand-900" href={paper.external.url} target="_blank" rel="noreferrer">DOI {paper.external.doi}<ExternalLink size={12} /></a></p>
          </Callout></div>
        )}
        <h2 className="mt-6 mb-2 text-lg font-bold">Resumen</h2>
        <p className="max-w-3xl leading-relaxed text-ink-800">{paper.abstract}</p>
        <p className="mt-4 text-sm"><b>Temas:</b> <span className="text-ink-700">{topics.map(t => `${t!.category} › ${t!.name}`).join('; ')}</span></p>
        {paper.keywords.length > 0 && <p className="mt-1 text-sm"><b>Palabras clave:</b> <span className="text-ink-700">{paper.keywords.join('; ')}</span></p>}
      </article>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            {paper.status === 'en_curso' ? (
              <div className="flex gap-3">
                <FlaskConical className="shrink-0 text-amber-700" size={28} />
                <div>
                  <p className="font-bold text-ink-900">Trabajo en curso</p>
                  <p className="text-sm text-ink-600">Todavía no hay documento. Si trabajas en un tema parecido, contacta con los autores para colaborar o evitar duplicar esfuerzos.</p>
                </div>
              </div>
            ) : reason ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {!showViewer && <Button onClick={openViewer}><BookOpenCheck size={16} />Leer documento</Button>}
                  {canDownload(s, me.id, paper)
                    ? <Button variant="secondary" disabled={downloading} onClick={download}><Download size={16} />{downloading ? 'Preparando…' : 'Descargar con marca de agua'}</Button>
                    : <span className="flex items-center gap-1 text-sm text-ink-500"><Lock size={14} />Descarga deshabilitada por el autor</span>}
                  <span className="ml-auto text-xs text-ink-500">
                    {reason === 'gestor' && 'Acceso como autor/admin'}
                    {reason === 'visibilidad' && (paper.visibility === 'publica' ? 'Acceso: paper público' : 'Acceso: miembro de un grupo autorizado')}
                    {reason === 'concedido' && `Acceso concedido ${grant?.expiresAt ? `hasta el ${fmtDate(grant.expiresAt)}` : 'permanente'}`}
                  </span>
                </div>
                {showViewer && version && <div className="mt-4"><PdfViewer version={version} watermark={watermark} /></div>}
              </div>
            ) : pending ? (
              <Callout>Solicitud de acceso enviada el {fmtDate(pending.createdAt)}. Los autores (o el admin local de su grupo) la revisarán.</Callout>
            ) : canRequestAccess(s, me.id, paper) ? (
              <RequestForm paper={paper} />
            ) : (
              <p className="text-sm text-ink-500">El documento no está disponible.</p>
            )}
          </Card>

          {canManagePaper(s, me.id, paper) && <ManagePanel paper={paper} />}
        </div>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-3 font-bold">{paper.external ? 'Subido por' : 'Autores'}</h2>
            <div className="space-y-2">{authors.map(a => <AuthorContact key={a.id} user={a} paperId={paper.id} />)}</div>
          </Card>
          {similar.length > 0 && (
            <div>
              <h2 className="border-b-2 border-brand-700 pb-1.5 font-bold">Trabajos similares</h2>
              <div>{similar.map(p => <PaperCard key={p.id} paper={p} compact />)}</div>
            </div>
          )}
          {canRead(s, me.id, paper) && paper.versions.length > 1 && (
            <Card>
              <h2 className="mb-2 font-bold">Versiones</h2>
              <ul className="text-sm text-ink-600">{paper.versions.map(v => <li key={v.version}>v{v.version} · {fmtDate(v.uploadedAt)}</li>)}</ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
