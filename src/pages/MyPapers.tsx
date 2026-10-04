import { Link } from 'react-router-dom'
import { FilePlus2 } from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import { fmtDate } from '../lib/format'
import { Button, Card, Empty, PageHeader } from '../components/ui'
import { StatusBadge, VisibilityBadge } from '../components/PaperBits'

export function MyPapers() {
  const s = useStore()
  const me = useMe()
  const mine = s.papers.filter(p => p.authorIds.includes(me.id)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div>
      <PageHeader title="Mis papers" subtitle="Tus trabajos en todos sus estados."
        actions={<Link to="/papers/nuevo"><Button><FilePlus2 size={16} />Nuevo paper</Button></Link>} />
      {mine.length === 0 ? <Empty>Todavía no tienes papers.</Empty> : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr><th className="px-4 py-3">Título</th><th>Estado</th><th>Visibilidad</th><th className="text-right">Views</th><th className="text-right">Descargas</th><th className="text-right">Solicitudes</th><th className="px-4">Actualizado</th></tr>
            </thead>
            <tbody>
              {mine.map(p => {
                const views = s.events.filter(e => e.paperId === p.id && e.type === 'view').length
                const downloads = s.events.filter(e => e.paperId === p.id && e.type === 'download').length
                const pending = s.requests.filter(r => r.paperId === p.id && r.status === 'pendiente').length
                return (
                  <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="max-w-md px-4 py-3"><Link to={`/papers/${p.id}`} className="font-bold text-brand-700 hover:underline">{p.title}</Link></td>
                    <td><StatusBadge status={p.status} /></td>
                    <td><VisibilityBadge visibility={p.visibility} /></td>
                    <td className="text-right">{views}</td>
                    <td className="text-right">{downloads}</td>
                    <td className="text-right">{pending > 0 ? <Link to="/solicitudes" className="font-bold text-brand-700">{pending} pendientes</Link> : '—'}</td>
                    <td className="px-4 text-ink-500">{fmtDate(p.updatedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
