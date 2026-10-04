import type { PaperStatus, Role, User, Visibility } from './types'

export const fullName = (u?: User) => (u ? `${u.firstName} ${u.lastName}` : 'Usuario desconocido')
export const initials = (u?: User) => (u ? `${u.firstName[0]}${u.lastName[0]}` : '?')

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function fmtRelative(iso: string): string {
  const diff = Date.now() - Date.parse(iso)
  const min = Math.round(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  if (d < 30) return `hace ${d} ${d === 1 ? 'día' : 'días'}`
  return fmtDate(iso)
}

export const shortTitle = (t: string, n = 48) => (t.length > n ? `${t.slice(0, n).trimEnd()}…` : t)

export const ROLE_LABEL: Record<Role, string> = { reader: 'Reader', writer: 'Writer', admin_local: 'Admin local' }

export const STATUS_LABEL: Record<PaperStatus, string> = {
  en_curso: 'En curso', en_revision: 'En revisión', devuelto: 'Devuelto', publicado: 'Publicado', retirado: 'Retirado',
}

export const VISIBILITY_LABEL: Record<Visibility, string> = { publica: 'Pública', grupos: 'Grupos', privada: 'Privada' }

export const LANGUAGE_LABEL = { es: 'Español', en: 'Inglés', ca: 'Catalán', eu: 'Euskera', gl: 'Gallego' } as const
