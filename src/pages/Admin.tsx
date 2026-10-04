import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus, Trash2, X } from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import { adminLocalGroupIds, isGlobalAdmin } from '../lib/permissions'
import { fmtDate, fmtDateTime, fmtRelative, fullName, ROLE_LABEL } from '../lib/format'
import type { Group, Membership, Role } from '../lib/types'
import { Avatar, Badge, Button, Callout, Card, Empty, Field, inputCls, Modal, PageHeader, selectCls, Tabs } from '../components/ui'
import { StatusBadge, VisibilityBadge } from '../components/PaperBits'

type Tab = 'altas' | 'grupos' | 'usuarios' | 'papers' | 'temas' | 'auditoria'

function SignupRow({ m }: { m: Membership }) {
  const s = useStore()
  const [role, setRole] = useState<Role>('writer')
  const user = s.users.find(u => u.id === m.userId)
  return (
    <Card className="flex flex-wrap items-center gap-4">
      <Avatar user={user} size={40} />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-bold">{fullName(user)} <span className="font-normal text-ink-500">· {user?.email}</span></p>
        <p className="text-ink-600">Quiere unirse a <b>{s.groups.find(g => g.id === m.groupId)?.name}</b> · {fmtRelative(m.requestedAt)}</p>
        <p className="text-xs text-ink-500">Nº colegiado: {user?.collegiateNumber || '—'} <span className="text-amber-700">[verificación pendiente de definir con el cliente]</span></p>
      </div>
      <select value={role} onChange={e => setRole(e.target.value as Role)} className="rounded border border-ink-300 px-2 py-1.5 text-sm">
        <option value="writer">Writer</option><option value="reader">Reader</option>
      </select>
      <Button size="sm" onClick={() => s.resolveMembership(m.id, true, role)}><Check size={14} />Aprobar</Button>
      <Button size="sm" variant="danger" onClick={() => s.resolveMembership(m.id, false, role)}><X size={14} />Rechazar</Button>
    </Card>
  )
}

function GroupsTab({ groupIds, global }: { groupIds: string[]; global: boolean }) {
  const s = useStore()
  const [selected, setSelected] = useState(groupIds[0])
  const [addUser, setAddUser] = useState('')
  const [addRole, setAddRole] = useState<Role>('writer')
  const [creating, setCreating] = useState(false)
  const [newGroup, setNewGroup] = useState<Omit<Group, 'id'>>({ name: '', kind: 'trabajo', description: '' })
  const groups = s.groups.filter(g => groupIds.includes(g.id))
  const members = s.memberships.filter(m => m.groupId === selected && m.status === 'active')
    .map(m => ({ m, u: s.users.find(u => u.id === m.userId)! })).sort((a, b) => fullName(a.u).localeCompare(fullName(b.u)))
  const nonMembers = s.users.filter(u => !members.some(x => x.u.id === u.id)).sort((a, b) => fullName(a).localeCompare(fullName(b)))

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-2">
        {groups.map(g => {
          const count = s.memberships.filter(m => m.groupId === g.id && m.status === 'active').length
          return (
            <button key={g.id} onClick={() => setSelected(g.id)}
              className={`block w-full rounded border p-3 text-left ${selected === g.id ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'}`}>
              <p className="text-sm font-bold">{g.name}</p>
              <p className="text-xs text-ink-500">{g.kind} · {count} miembros</p>
            </button>
          )
        })}
        {global && <Button variant="secondary" className="w-full" onClick={() => setCreating(true)}><Plus size={14} />Crear grupo</Button>}
      </div>
      <Card className="overflow-x-auto p-0 lg:col-span-2">
        {global && (
          <div className="flex flex-wrap gap-2 border-b border-ink-100 p-3">
            <select value={addUser} onChange={e => setAddUser(e.target.value)} className={`${selectCls} min-w-0 flex-1`}>
              <option value="">Añadir miembro…</option>
              {nonMembers.map(u => <option key={u.id} value={u.id}>{fullName(u)} · {u.email}</option>)}
            </select>
            <select value={addRole} onChange={e => setAddRole(e.target.value as Role)} className={selectCls}>
              <option value="reader">Reader</option><option value="writer">Writer</option><option value="admin_local">Admin local</option>
            </select>
            <Button disabled={!addUser} onClick={() => { s.addMember(addUser, selected, addRole); setAddUser('') }}>Añadir</Button>
          </div>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr><th className="px-4 py-2">Miembro</th><th>Email</th><th>Rol en el grupo</th><th>Desde</th><th /></tr>
          </thead>
          <tbody>
            {members.map(({ m, u }) => (
              <tr key={m.id} className="border-t border-ink-100">
                <td className="px-4 py-2">{fullName(u)}</td>
                <td className="text-ink-500">{u.email}</td>
                <td>
                  <select value={m.role} disabled={!global && m.role === 'admin_local'} onChange={e => s.setMemberRole(m.id, e.target.value as Role)}
                    className="rounded border border-ink-300 px-1.5 py-1 text-xs">
                    <option value="reader">Reader</option><option value="writer">Writer</option>
                    {(global || m.role === 'admin_local') && <option value="admin_local">Admin local</option>}
                  </select>
                </td>
                <td className="text-ink-500">{fmtDate(m.resolvedAt)}</td>
                <td className="px-4 text-right">
                  {(global || m.role !== 'admin_local') && (
                    <button className="text-ink-400 hover:text-red-800" aria-label="Quitar del grupo" onClick={() => confirm(`¿Quitar a ${fullName(u)} del grupo?`) && s.removeMembership(m.id)}><Trash2 size={15} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {creating && (
        <Modal title="Crear grupo" onClose={() => setCreating(false)}>
          <div className="space-y-3">
            <Field label="Nombre"><input value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} className={inputCls} /></Field>
            <Field label="Tipo">
              <select value={newGroup.kind} onChange={e => setNewGroup({ ...newGroup, kind: e.target.value as Group['kind'] })} className={inputCls}>
                <option value="colegio">Colegio</option><option value="comunidad">Comunidad autónoma</option><option value="trabajo">Grupo de trabajo</option>
              </select>
            </Field>
            <Field label="Descripción"><input value={newGroup.description} onChange={e => setNewGroup({ ...newGroup, description: e.target.value })} className={inputCls} /></Field>
            <div className="flex justify-end"><Button disabled={newGroup.name.trim().length < 3} onClick={() => { s.createGroup(newGroup); setCreating(false) }}>Crear</Button></div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function UsersTab() {
  const s = useStore()
  const [q, setQ] = useState('')
  const users = s.users.filter(u => `${fullName(u)} ${u.email}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => fullName(a).localeCompare(fullName(b)))
  return (
    <Card className="overflow-x-auto p-0">
      <div className="border-b border-ink-100 p-3"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar usuario…" className={inputCls} /></div>
      <table className="w-full text-sm">
        <thead>
          <tr><th className="px-4 py-2">Usuario</th><th>Nº colegiado</th><th>Grupos y roles</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t border-ink-100 align-top">
              <td className="px-4 py-2">
                <p className="font-bold">{fullName(u)} {u.isGlobalAdmin && <Badge color="violet">Admin global</Badge>}</p>
                <p className="text-xs text-ink-500">{u.email}</p>
              </td>
              <td className="py-2 text-ink-500">{u.collegiateNumber ?? '—'}</td>
              <td className="py-2 pr-4">
                <div className="flex flex-wrap gap-1">
                  {s.memberships.filter(m => m.userId === u.id).map(m => (
                    <Badge key={m.id} color={m.status === 'pending' ? 'amber' : m.status === 'rejected' ? 'red' : m.role === 'admin_local' ? 'violet' : 'slate'}>
                      {s.groups.find(g => g.id === m.groupId)?.name.replace('Colegio de Veterinarios de ', '')} · {m.status === 'active' ? ROLE_LABEL[m.role] : m.status === 'pending' ? 'pendiente' : 'rechazado'}
                    </Badge>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function TopicsTab() {
  const s = useStore()
  const categories = [...new Set(s.topics.map(t => t.category))]
  const [category, setCategory] = useState(categories[0])
  const [name, setName] = useState('')
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {categories.map(c => (
          <Card key={c}>
            <h3 className="mb-2 font-bold">{c}</h3>
            <div className="flex flex-wrap gap-2">
              {s.topics.filter(t => t.category === c).map(t => (
                <span key={t.id} className="inline-flex items-center gap-1 rounded-sm border border-brand-200 bg-brand-50 px-2 py-0.5 text-sm text-brand-900">
                  {t.name}
                  <button onClick={() => s.removeTopic(t.id)} className="text-brand-400 hover:text-red-800" aria-label={`Eliminar ${t.name}`}><X size={13} /></button>
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Card className="h-fit space-y-3">
        <h3 className="font-bold">Añadir tema al catálogo</h3>
        <Field label="Categoría" hint="Escribe una nueva o elige una existente">
          <input list="cats" value={category} onChange={e => setCategory(e.target.value)} className={inputCls} />
          <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Tema"><input value={name} onChange={e => setName(e.target.value)} className={inputCls} /></Field>
        <Button disabled={!category.trim() || !name.trim()} onClick={() => { s.addTopic(category.trim(), name.trim()); setName('') }}><Plus size={14} />Añadir</Button>
        <p className="text-xs text-ink-500">Los writers eligen temas de este catálogo y pueden añadir palabras clave libres.</p>
      </Card>
    </div>
  )
}

export function AdminPage() {
  const s = useStore()
  const me = useMe()
  const global = isGlobalAdmin(s, me.id)
  const scope = global ? s.groups.map(g => g.id) : adminLocalGroupIds(s, me.id)
  const [tab, setTab] = useState<Tab>('altas')

  const pending = s.memberships.filter(m => m.status === 'pending' && scope.includes(m.groupId))
  const papers = s.papers.filter(p => scope.includes(p.ownerGroupId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  if (scope.length === 0) return <Callout tone="warn">No tienes permisos de administración.</Callout>

  const tabs: { id: Tab; label: string }[] = [
    { id: 'altas', label: `Altas pendientes (${pending.length})` },
    { id: 'grupos', label: global ? 'Grupos y miembros' : 'Mi grupo' },
    ...(global ? [{ id: 'usuarios' as Tab, label: 'Usuarios' }] : []),
    { id: 'papers', label: global ? 'Papers' : 'Papers del grupo' },
    ...(global ? [{ id: 'temas' as Tab, label: 'Catálogo de temas' }, { id: 'auditoria' as Tab, label: 'Auditoría' }] : []),
  ]

  return (
    <div>
      <PageHeader title={global ? 'Administración global' : 'Administración local'}
        subtitle={global ? 'Grupos, usuarios y roles al estilo de los grupos de Azure AD.' : `Gestionas: ${scope.map(id => s.groups.find(g => g.id === id)?.name).join(', ')}`} />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'altas' && (pending.length === 0 ? <Empty>No hay altas pendientes.</Empty> : <div className="space-y-3">{pending.map(m => <SignupRow key={m.id} m={m} />)}</div>)}
      {tab === 'grupos' && <GroupsTab groupIds={scope} global={global} />}
      {tab === 'usuarios' && <UsersTab />}
      {tab === 'papers' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr><th className="px-4 py-2">Paper</th><th>Estado</th><th>Visibilidad</th><th>Autores</th><th /></tr>
            </thead>
            <tbody>
              {papers.map(p => (
                <tr key={p.id} className="border-t border-ink-100">
                  <td className="max-w-md px-4 py-2">{p.title}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><VisibilityBadge visibility={p.visibility} /></td>
                  <td className="text-ink-500">{p.authorIds.map(id => fullName(s.users.find(u => u.id === id))).join(', ')}</td>
                  <td className="px-4"><Link to={`/papers/${p.id}`}><Button size="sm" variant="secondary">Gestionar</Button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {tab === 'temas' && <TopicsTab />}
      {tab === 'auditoria' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr><th className="px-4 py-2">Fecha</th><th>Quién</th><th>Acción</th><th>Detalle</th></tr>
            </thead>
            <tbody>
              {s.audit.map(a => (
                <tr key={a.id} className="border-t border-ink-100">
                  <td className="whitespace-nowrap px-4 py-2 text-ink-500">{fmtDateTime(a.at)}</td>
                  <td>{fullName(s.users.find(u => u.id === a.actorId))}</td>
                  <td><Badge>{a.action}</Badge></td>
                  <td className="pr-4 text-ink-600">{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
