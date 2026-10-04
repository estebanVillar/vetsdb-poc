import { useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, Bell, ClipboardCheck, FilePlus2, FileText, Inbox, MessageSquare, RotateCcw, Search, Settings,
  ShieldCheck, User as UserIcon, UserPlus,
} from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import { adminLocalGroupIds, canPublish, canResolveRequest, canReview, isAnyAdmin, isApproved, isGlobalAdmin } from '../lib/permissions'
import { fmtRelative, fullName } from '../lib/format'
import { Avatar } from './ui'
import { PendingApproval } from '../pages/Pending'

function NavItem({ to, icon: Icon, label, count }: { to: string; icon: typeof Search; label: string; count?: number }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `flex items-center gap-2.5 border-l-4 py-2 pl-3 pr-3 text-sm ${isActive ? 'border-brand-700 bg-white font-bold text-ink-900' : 'border-transparent text-brand-700 hover:bg-ink-100 hover:text-brand-900'}`}
    >
      <Icon size={16} />
      <span className="flex-1">{label}</span>
      {!!count && <span className="min-w-5 rounded-sm bg-brand-700 px-1.5 text-center text-xs font-bold text-white">{count}</span>}
    </NavLink>
  )
}

function NavSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      {title && <p className="mb-1 px-4 text-xs font-bold text-ink-500">{title}</p>}
      {children}
    </div>
  )
}

function Notifications() {
  const s = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const mine = s.notifications.filter(n => n.userId === s.currentUserId)
  const unread = mine.filter(n => !n.read).length
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="relative rounded-sm p-2 text-white/90 hover:bg-white/10 hover:text-white" aria-label="Notificaciones">
        <Bell size={19} />
        {unread > 0 && <span className="absolute right-0 top-0 rounded-sm bg-[#fdb81e] px-1 text-[10px] font-black text-brand-950">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-96 rounded border border-ink-300 bg-white text-ink-900 shadow-lg">
          <div className="flex items-center justify-between border-b border-ink-200 bg-ink-50 px-4 py-2.5">
            <span className="text-sm font-bold">Notificaciones</span>
            <button className="text-xs text-brand-700 underline hover:text-brand-900" onClick={() => s.markNotificationsRead()}>Marcar todas como leídas</button>
          </div>
          <div className="max-h-96 overflow-auto">
            {mine.length === 0 && <p className="p-4 text-sm text-ink-500">No tienes notificaciones.</p>}
            {mine.slice(0, 20).map(n => (
              <button key={n.id} onClick={() => { setOpen(false); if (n.link) navigate(n.link) }}
                className={`block w-full border-b border-ink-100 border-l-4 px-4 py-2.5 text-left text-sm hover:bg-ink-50 ${n.read ? 'border-l-transparent text-ink-500' : 'border-l-brand-500 text-ink-900'}`}>
                {n.text}
                <span className="mt-0.5 block text-xs text-ink-400">{fmtRelative(n.createdAt)} · en producción también por email</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UserSwitcher() {
  const s = useStore()
  const navigate = useNavigate()
  const personas = s.users.filter(u => u.persona)
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-white/70 lg:inline">Ver como</span>
      <select
        value={s.currentUserId}
        onChange={e => { s.setCurrentUser(e.target.value); navigate('/') }}
        className="max-w-72 rounded-[3px] border-0 bg-white px-2 py-1.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
      >
        {personas.map(u => <option key={u.id} value={u.id}>{fullName(u)} — {u.persona}</option>)}
      </select>
    </label>
  )
}

export function Layout() {
  const s = useStore()
  const me = useMe()
  const location = useLocation()
  const navigate = useNavigate()

  const counts = useMemo(() => {
    const reviews = s.papers.filter(p => p.status === 'en_revision' && canReview(s, me.id, p)).length
    const requests = s.requests.filter(r => {
      const p = s.papers.find(x => x.id === r.paperId)
      return r.status === 'pendiente' && p && canResolveRequest(s, me.id, p)
    }).length
    const scope = adminLocalGroupIds(s, me.id)
    const signups = s.memberships.filter(m => m.status === 'pending' && (isGlobalAdmin(s, me.id) || scope.includes(m.groupId))).length
    return { reviews, requests, signups }
  }, [s, me.id])

  const approved = isApproved(s, me.id)
  const openRoutes = ['/registro', '/perfil']
  const gated = !approved && !openRoutes.includes(location.pathname)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-ink-100 px-6 py-1 text-xs text-ink-700">
        Prueba de concepto · todos los datos y personas son ficticios
      </div>
      <header className="sticky top-0 z-30 flex items-center gap-4 bg-brand-900 px-6 py-2.5 text-white">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-[1.6rem] leading-none tracking-tight"><span className="font-normal">vets</span><span className="font-black">DB</span></span>
          <span className="hidden border-l border-white/30 pl-2 text-xs text-white/75 sm:inline">Red de investigación veterinaria</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <UserSwitcher />
          <Notifications />
          <Avatar user={me} size={30} />
          <button className="rounded-sm p-2 text-white/80 hover:bg-white/10 hover:text-white" title="Reiniciar la demo" aria-label="Reiniciar la demo" onClick={async () => {
            if (confirm('¿Reiniciar la demo? Se perderán los cambios hechos.')) { await s.resetDemo(); navigate('/') }
          }}><RotateCcw size={16} /></button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-[54px] hidden h-[calc(100vh-54px)] w-56 shrink-0 flex-col overflow-auto border-r border-ink-200 bg-ink-50 py-5 md:flex">
          {approved && <>
            <NavSection title="Investigación">
              <NavItem to="/" icon={Search} label="Buscar" />
              {canPublish(s, me.id) && <NavItem to="/papers/nuevo" icon={FilePlus2} label="Nuevo paper" />}
              {canPublish(s, me.id) && <NavItem to="/mis-papers" icon={FileText} label="Mis papers" />}
              <NavItem to="/solicitudes" icon={Inbox} label="Solicitudes" count={counts.requests} />
              <NavItem to="/chat" icon={MessageSquare} label="Chat" />
              {(canPublish(s, me.id) || isAnyAdmin(s, me.id)) && <NavItem to="/estadisticas" icon={BarChart3} label="Estadísticas" />}
            </NavSection>
            {isAnyAdmin(s, me.id) && (
              <NavSection title="Administración">
                <NavItem to="/revision" icon={ClipboardCheck} label="Revisión" count={counts.reviews} />
                <NavItem to="/admin" icon={isGlobalAdmin(s, me.id) ? ShieldCheck : Settings} label={isGlobalAdmin(s, me.id) ? 'Admin global' : 'Admin local'} count={counts.signups} />
              </NavSection>
            )}
          </>}
          <div className="mt-auto border-t border-ink-200 pt-3">
            <NavItem to="/perfil" icon={UserIcon} label="Mi perfil" />
            <NavItem to="/registro" icon={UserPlus} label="Registro (demo)" />
          </div>
        </aside>

        <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-7">
          {gated ? <PendingApproval /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
