import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, Eye, Inbox, KeyRound, Users } from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import { adminLocalGroupIds, isGlobalAdmin } from '../lib/permissions'
import { fmtDate, fullName, shortTitle } from '../lib/format'
import { Callout, Card, PageHeader, selectCls } from '../components/ui'

const WEEK = 7 * 86_400_000

function Kpi({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <div className="bg-white px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-[13px] text-ink-600"><Icon size={14} className="text-ink-400" />{label}</p>
      <p className="mt-1 text-[1.75rem] font-black leading-none text-brand-900">{value.toLocaleString('es-ES')}</p>
    </div>
  )
}

export function StatsPage() {
  const s = useStore()
  const me = useMe()
  const scopes = [
    { id: 'mine', label: 'Mis papers' },
    ...adminLocalGroupIds(s, me.id).map(g => ({ id: `group:${g}`, label: `Grupo: ${s.groups.find(x => x.id === g)?.name}` })),
    ...(isGlobalAdmin(s, me.id) ? [{ id: 'all', label: 'Toda la plataforma' }] : []),
  ]
  const [scope, setScope] = useState(scopes.length > 1 ? scopes[1].id : 'mine')

  const papers = useMemo(() => s.papers.filter(p =>
    scope === 'all' ? true : scope === 'mine' ? p.authorIds.includes(me.id) : p.ownerGroupId === scope.slice(6)), [s.papers, scope, me.id])
  const ids = new Set(papers.map(p => p.id))
  const events = s.events.filter(e => ids.has(e.paperId))
  const views = events.filter(e => e.type === 'view')
  const downloads = events.filter(e => e.type === 'download')
  const requests = s.requests.filter(r => ids.has(r.paperId))
  const grants = s.grants.filter(g => ids.has(g.paperId) && !g.revoked)

  const weekly = useMemo(() => {
    const now = Date.now()
    return Array.from({ length: 12 }, (_, i) => {
      const end = now - (11 - i) * WEEK
      const start = end - WEEK
      const inWeek = (at: string) => { const t = Date.parse(at); return t > start && t <= end }
      return {
        semana: new Date(end).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        Views: views.filter(e => inWeek(e.at)).length,
        Descargas: downloads.filter(e => inWeek(e.at)).length,
      }
    })
  }, [views, downloads])

  const recentDownloads = [...downloads].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12)

  return (
    <div>
      <PageHeader title="Estadísticas" subtitle="Views, descargas y solicitudes de los últimos 90 días."
        actions={scopes.length > 1 && (
          <select value={scope} onChange={e => setScope(e.target.value)} className={selectCls}>
            {scopes.map(sc => <option key={sc.id} value={sc.id}>{sc.label}</option>)}
          </select>
        )} />
      <div className="mb-5 grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi icon={Eye} label="Visualizaciones" value={views.length} />
        <Kpi icon={Users} label="Lectores únicos" value={new Set(views.map(v => v.userId)).size} />
        <Kpi icon={Download} label="Descargas" value={downloads.length} />
        <Kpi icon={Inbox} label="Solicitudes recibidas" value={requests.length} />
        <Kpi icon={KeyRound} label="Accesos concedidos" value={grants.length} />
      </div>
      <Card className="mb-5">
        <h2 className="mb-3 font-bold">Actividad semanal</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly} margin={{ left: -20, right: 10 }}>
              <CartesianGrid vertical={false} stroke="#dfe0e2" />
              <XAxis dataKey="semana" tick={{ fontSize: 12, fill: '#5b616b' }} tickLine={false} axisLine={{ stroke: '#c4c6ca' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5b616b' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 3, borderColor: '#c4c6ca', fontSize: 13 }} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="Views" stroke="#20558a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="Descargas" stroke="#d4721c" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-x-auto p-0 lg:col-span-2">
          <h2 className="px-5 pt-4 font-bold">Por paper</h2>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr><th className="px-5 py-2">Paper</th><th className="text-right">Views</th><th className="text-right">Únicos</th><th className="text-right">Descargas</th><th className="px-5 text-right">Solicitudes</th></tr>
            </thead>
            <tbody>
              {papers.filter(p => p.status === 'publicado').map(p => {
                const v = views.filter(e => e.paperId === p.id)
                return (
                  <tr key={p.id} className="border-t border-ink-100">
                    <td className="px-5 py-2"><Link to={`/papers/${p.id}`} className="text-brand-700 hover:underline">{shortTitle(p.title, 60)}</Link></td>
                    <td className="text-right">{v.length}</td>
                    <td className="text-right">{new Set(v.map(e => e.userId)).size}</td>
                    <td className="text-right">{downloads.filter(e => e.paperId === p.id).length}{!p.allowDownload && <span className="text-xs text-ink-400"> (bloqueada)</span>}</td>
                    <td className="px-5 text-right">{requests.filter(r => r.paperId === p.id).length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
        <Card>
          <h2 className="mb-2 font-bold">Quién ha descargado</h2>
          <p className="mb-3 text-xs text-ink-500">Las descargas son nominales. Las visualizaciones solo se muestran agregadas para proteger la privacidad del lector.</p>
          <ul className="space-y-1.5 text-sm">
            {recentDownloads.length === 0 && <li className="text-ink-400">Sin descargas.</li>}
            {recentDownloads.map((d, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span className="truncate">{fullName(s.users.find(u => u.id === d.userId))}</span>
                <span className="shrink-0 text-xs text-ink-400">{fmtDate(d.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-5"><Callout>Demo: los datos de actividad se han generado automáticamente para ilustrar los paneles.</Callout></div>
    </div>
  )
}
