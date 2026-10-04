import { useState } from 'react'
import { useMe, useStore } from '../lib/store'
import { fmtRelative, fullName, ROLE_LABEL } from '../lib/format'
import { Avatar, Badge, Button, Card, Field, inputCls, PageHeader } from '../components/ui'

export function ProfilePage() {
  const s = useStore()
  const me = useMe()
  const [groupId, setGroupId] = useState('')
  const mine = s.memberships.filter(m => m.userId === me.id)
  const available = s.groups.filter(g => !mine.some(m => m.groupId === g.id && m.status !== 'rejected'))
  const categories = [...new Set(s.topics.map(t => t.category))]

  return (
    <div>
      <PageHeader title="Mi perfil" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar user={me} size={48} />
            <div><p className="font-bold">{fullName(me)}</p><p className="text-sm text-ink-500">{me.email}</p></div>
          </div>
          <Field label="Teléfono"><input value={me.phone ?? ''} onChange={e => s.updateProfile({ phone: e.target.value })} className={inputCls} /></Field>
          <div>
            <p className="mb-1 text-sm font-bold text-ink-700">¿Qué datos de contacto ven los demás?</p>
            <p className="mb-2 text-xs text-ink-500">Tu nombre y colegio siempre son visibles, y el chat interno siempre está disponible.</p>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={me.showEmail} onChange={e => s.updateProfile({ showEmail: e.target.checked })} />Mostrar mi email</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={me.showPhone} onChange={e => s.updateProfile({ showPhone: e.target.checked })} />Mostrar mi teléfono</label>
          </div>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-bold">Mis grupos</h2>
          <ul className="space-y-1.5 text-sm">
            {mine.map(m => (
              <li key={m.id} className="flex items-center justify-between">
                <span>{s.groups.find(g => g.id === m.groupId)?.name}</span>
                {m.status === 'active' ? <Badge color={m.role === 'admin_local' ? 'violet' : 'green'}>{ROLE_LABEL[m.role]}</Badge>
                  : m.status === 'pending' ? <Badge color="amber">Pendiente · {fmtRelative(m.requestedAt)}</Badge> : <Badge color="red">Rechazado</Badge>}
              </li>
            ))}
            {me.isGlobalAdmin && <li><Badge color="violet">Admin global de la plataforma</Badge></li>}
          </ul>
          <div className="flex gap-2 border-t border-ink-100 pt-3">
            <select value={groupId} onChange={e => setGroupId(e.target.value)} className={inputCls}>
              <option value="">Solicitar unirme a otro grupo…</option>
              {available.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <Button disabled={!groupId} onClick={() => { s.requestMembership(groupId); setGroupId('') }}>Solicitar</Button>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-1 font-bold">Temas que sigo</h2>
          <p className="mb-3 text-xs text-ink-500">Te avisaremos cuando alguien empiece o publique un trabajo en estos temas.</p>
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-3">
            {categories.map(c => (
              <div key={c} className="text-sm">
                <p className="font-bold text-ink-500">{c}</p>
                {s.topics.filter(t => t.category === c).map(t => (
                  <label key={t.id} className="ml-2 flex items-center gap-1.5">
                    <input type="checkbox" checked={me.followedTopics.includes(t.id)} onChange={e => s.updateProfile({
                      followedTopics: e.target.checked ? [...me.followedTopics, t.id] : me.followedTopics.filter(x => x !== t.id),
                    })} />{t.name}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
