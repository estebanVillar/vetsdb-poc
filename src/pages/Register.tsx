import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useStore } from '../lib/store'
import { Button, Callout, Card, Field, inputCls, PageHeader } from '../components/ui'

export function RegisterPage() {
  const s = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', collegiateNumber: '', groupId: 'g-huelva', extra: [] as string[], consent: false })
  const set = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }))
  const colegios = s.groups.filter(g => g.kind === 'colegio')
  const others = s.groups.filter(g => g.kind !== 'colegio')
  const valid = form.firstName && form.lastName && /.+@.+\..+/.test(form.email) && form.consent

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Crear cuenta" subtitle="Tu alta quedará pendiente hasta que el admin local de tu colegio la apruebe." />
      <div className="mb-4"><Callout>Demo: al registrarte pasarás a «ver como» el nuevo usuario. Después cambia a su admin local para aprobar el alta.</Callout></div>
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre"><input value={form.firstName} onChange={e => set({ firstName: e.target.value })} className={inputCls} /></Field>
          <Field label="Apellidos"><input value={form.lastName} onChange={e => set({ lastName: e.target.value })} className={inputCls} /></Field>
        </div>
        <Field label="Email"><input type="email" value={form.email} onChange={e => set({ email: e.target.value })} className={inputCls} /></Field>
        <Field label="Nº de colegiado" hint="Pendiente de definir con el cliente: revisión manual, solo email o validación contra un registro oficial.">
          <input value={form.collegiateNumber} onChange={e => set({ collegiateNumber: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Colegio de veterinarios">
          <select value={form.groupId} onChange={e => set({ groupId: e.target.value })} className={inputCls}>
            {colegios.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
        <div>
          <p className="mb-1 text-sm font-bold text-ink-700">Otros grupos a los que quieres unirte (opcional)</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {others.map(g => (
              <label key={g.id} className="flex items-center gap-1.5">
                <input type="checkbox" checked={form.extra.includes(g.id)} onChange={e => set({ extra: e.target.checked ? [...form.extra, g.id] : form.extra.filter(x => x !== g.id) })} />{g.name}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded border border-dashed border-ink-300 p-3 text-xs text-ink-500">[Más preguntas del registro pendientes de definir con el cliente]</div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={form.consent} onChange={e => set({ consent: e.target.checked })} />
          He leído y acepto los términos de uso y la política de privacidad. [Textos legales pendientes del cliente]
        </label>
        <div className="flex justify-end">
          <Button disabled={!valid} onClick={() => {
            s.register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), collegiateNumber: form.collegiateNumber.trim(), groupIds: [form.groupId, ...form.extra] })
            navigate('/')
          }}><UserPlus size={16} />Crear cuenta</Button>
        </div>
        <p className="text-center text-xs text-ink-400">En producción: verificación de email, CAPTCHA, y acceso con contraseña, magic link o Google/Microsoft.</p>
      </Card>
    </div>
  )
}
