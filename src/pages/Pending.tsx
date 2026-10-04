import { Clock } from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import { fmtRelative } from '../lib/format'
import { Card, Callout } from '../components/ui'

export function PendingApproval() {
  const s = useStore()
  const me = useMe()
  const pending = s.memberships.filter(m => m.userId === me.id)
  return (
    <div className="mx-auto max-w-xl pt-10">
      <Card className="text-center">
        <Clock className="mx-auto mb-3 text-amber-700" size={40} />
        <h1 className="text-xl font-bold">Tu alta está pendiente de aprobación</h1>
        <p className="mt-2 text-sm text-ink-600">
          Hola {me.firstName}. Hasta que el admin local de tu colegio o grupo apruebe tu solicitud, no puedes consultar papers.
        </p>
        <ul className="mt-4 space-y-1 text-sm">
          {pending.map(m => (
            <li key={m.id}>
              <b>{s.groups.find(g => g.id === m.groupId)?.name}</b> · {m.status === 'pending' ? `solicitado ${fmtRelative(m.requestedAt)}` : 'rechazado'}
            </li>
          ))}
        </ul>
      </Card>
      <div className="mt-4">
        <Callout>Demo: cambia a la admin local del grupo (p. ej. <b>Carmen Ruiz</b> para Huelva o <b>Pablo Navarro</b> para Madrid) con el selector «Ver como» y aprueba el alta desde <b>Admin local → Altas pendientes</b>.</Callout>
      </div>
    </div>
  )
}
