import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, MessageSquare, X } from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import { activeMemberships, canResolveRequest, isAuthor } from '../lib/permissions'
import { fmtDate, fmtRelative, fullName, shortTitle } from '../lib/format'
import type { AccessRequest, RequestStatus } from '../lib/types'
import { Avatar, Badge, Button, Card, Empty, Field, inputCls, Modal, PageHeader, Tabs } from '../components/ui'

const STATUS_COLOR = { pendiente: 'amber', aceptada: 'green', denegada: 'red' } as const

function ResolveModal({ request, accept, onClose }: { request: AccessRequest; accept: boolean; onClose: () => void }) {
  const s = useStore()
  const paper = s.papers.find(p => p.id === request.paperId)!
  const [days, setDays] = useState('90')
  const [allowDownload, setAllowDownload] = useState(paper.allowDownload)
  const [message, setMessage] = useState('')
  return (
    <Modal title={accept ? 'Aceptar solicitud' : 'Denegar solicitud'} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-ink-600">{fullName(s.users.find(u => u.id === request.requesterId))} → «{shortTitle(paper.title, 70)}»</p>
        {accept && <>
          <Field label="Duración del acceso">
            <select value={days} onChange={e => setDays(e.target.value)} className={inputCls}>
              <option value="30">30 días</option><option value="90">90 días</option><option value="180">180 días</option><option value="0">Permanente (revocable)</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={allowDownload} onChange={e => setAllowDownload(e.target.checked)} />Permitir descarga a esta persona (con marca de agua)
          </label>
        </>}
        <Field label={accept ? 'Mensaje (opcional)' : 'Motivo (opcional)'}>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className={inputCls} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant={accept ? 'primary' : 'danger'} onClick={() => {
            s.resolveRequest(request.id, accept, { expiresInDays: accept && days !== '0' ? Number(days) : undefined, allowDownload, responseMessage: message })
            onClose()
          }}>{accept ? 'Conceder acceso' : 'Denegar'}</Button>
        </div>
      </div>
    </Modal>
  )
}

function RequestRow({ r, received }: { r: AccessRequest; received: boolean }) {
  const s = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const [modal, setModal] = useState<'accept' | 'deny'>()
  const paper = s.papers.find(p => p.id === r.paperId)!
  const requester = s.users.find(u => u.id === r.requesterId)
  const resolver = r.resolvedBy ? s.users.find(u => u.id === r.resolvedBy) : undefined
  const groups = activeMemberships(s, r.requesterId).map(m => s.groups.find(g => g.id === m.groupId)?.name)
  const onBehalf = received && !isAuthor(paper, me.id)

  return (
    <Card className="flex flex-col gap-3 sm:flex-row">
      <Avatar user={received ? requester : s.users.find(u => u.id === paper.authorIds[0])} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>
          <span className="text-xs text-ink-400">{fmtRelative(r.createdAt)}</span>
          {onBehalf && r.status === 'pendiente' && <Badge color="violet">Puedes resolverla en nombre de los autores</Badge>}
        </div>
        <p className="mt-1 text-sm">
          {received ? <><b>{fullName(requester)}</b> <span className="text-ink-500">({groups.join(', ')})</span> quiere acceder a </> : 'Solicitaste acceso a '}
          <Link to={`/papers/${paper.id}`} className="font-bold text-brand-700 hover:underline">«{shortTitle(paper.title, 80)}»</Link>
        </p>
        <p className="mt-2 rounded bg-ink-50 p-2 text-sm italic text-ink-700">“{r.message}”</p>
        {r.status !== 'pendiente' && (
          <p className="mt-2 text-xs text-ink-500">
            {r.status === 'aceptada' ? 'Aceptada' : 'Denegada'} por {fullName(resolver)} el {fmtDate(r.resolvedAt)}{r.responseMessage && <>: «{r.responseMessage}»</>}
          </p>
        )}
      </div>
      {received && r.status === 'pendiente' && (
        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
          <Button size="sm" onClick={() => setModal('accept')}><Check size={14} />Aceptar</Button>
          <Button size="sm" variant="danger" onClick={() => setModal('deny')}><X size={14} />Denegar</Button>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/chat?c=${s.openConversation(r.requesterId, { paperId: r.paperId, requestId: r.id })}`)}>
            <MessageSquare size={14} />Comentar
          </Button>
        </div>
      )}
      {modal && <ResolveModal request={r} accept={modal === 'accept'} onClose={() => setModal(undefined)} />}
    </Card>
  )
}

export function RequestsPage() {
  const s = useStore()
  const me = useMe()
  const [tab, setTab] = useState<'recibidas' | 'enviadas' | 'accesos'>('recibidas')
  const [filter, setFilter] = useState<'todas' | RequestStatus>('pendiente')

  const received = s.requests.filter(r => {
    const p = s.papers.find(x => x.id === r.paperId)
    return p && canResolveRequest(s, me.id, p) && r.requesterId !== me.id
  })
  const sent = s.requests.filter(r => r.requesterId === me.id)
  const list = (tab === 'recibidas' ? received : sent).filter(r => filter === 'todas' || r.status === filter)
  const grants = s.grants.filter(g => {
    const p = s.papers.find(x => x.id === g.paperId)
    return p && canResolveRequest(s, me.id, p) && !g.revoked
  })

  return (
    <div>
      <PageHeader title="Solicitudes de acceso" subtitle="Acepta, deniega o comenta las peticiones a tus papers privados o de grupo." />
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'recibidas', label: `Recibidas (${received.filter(r => r.status === 'pendiente').length})` },
        { id: 'enviadas', label: `Enviadas (${sent.length})` },
        { id: 'accesos', label: `Accesos concedidos (${grants.length})` },
      ]} />
      {tab !== 'accesos' ? <>
        <div className="mb-4 flex gap-2">
          {(['pendiente', 'aceptada', 'denegada', 'todas'] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'primary' : 'secondary'} onClick={() => setFilter(f)}>{f}</Button>
          ))}
        </div>
        <div className="space-y-3">
          {list.length === 0 ? <Empty>No hay solicitudes en este estado.</Empty> : list.map(r => <RequestRow key={r.id} r={r} received={tab === 'recibidas'} />)}
        </div>
      </> : (
        grants.length === 0 ? <Empty>No has concedido accesos.</Empty> : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr><th className="px-4 py-3">Persona</th><th>Paper</th><th>Caduca</th><th>Descarga</th><th>Concedido por</th><th /></tr>
              </thead>
              <tbody>
                {grants.map(g => (
                  <tr key={g.id} className="border-t border-ink-100">
                    <td className="px-4 py-3">{fullName(s.users.find(u => u.id === g.userId))}</td>
                    <td>{shortTitle(s.papers.find(p => p.id === g.paperId)!.title)}</td>
                    <td>{g.expiresAt ? fmtDate(g.expiresAt) : 'Permanente'}</td>
                    <td>{g.allowDownload ? 'Sí' : 'No'}</td>
                    <td>{fullName(s.users.find(u => u.id === g.grantedBy))}</td>
                    <td className="px-4 text-right"><Button size="sm" variant="danger" onClick={() => s.revokeGrant(g.id)}>Revocar</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      )}
    </div>
  )
}
