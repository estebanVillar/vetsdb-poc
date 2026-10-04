import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { X } from 'lucide-react'
import type { User } from '../lib/types'
import { initials } from '../lib/format'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-900 disabled:bg-ink-300',
  secondary: 'bg-white text-brand-700 ring-1 ring-inset ring-brand-700 hover:bg-brand-50 disabled:text-ink-400 disabled:ring-ink-300',
  danger: 'bg-white text-red-800 ring-1 ring-inset ring-red-800 hover:bg-red-50',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'px-2.5 py-1 text-[13px]' : 'px-4 py-2 text-sm'
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[3px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed ${sz} ${VARIANTS[variant]} ${className}`}
    />
  )
}

const BADGE_COLORS = {
  green: 'border-green-300 bg-green-50 text-green-900',
  amber: 'border-amber-300 bg-amber-50 text-amber-900',
  blue: 'border-brand-200 bg-brand-50 text-brand-800',
  red: 'border-red-300 bg-red-50 text-red-900',
  slate: 'border-ink-200 bg-ink-50 text-ink-700',
  violet: 'border-purple-300 bg-purple-50 text-purple-900',
} as const
export type BadgeColor = keyof typeof BADGE_COLORS

export function Badge({ color = 'slate', children, className = '' }: { color?: BadgeColor; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-px text-xs ${BADGE_COLORS[color]} ${className}`}>{children}</span>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  const padding = /(^|\s)p-\d/.test(className) ? '' : 'p-5'
  return <div className={`rounded border border-ink-200 bg-white ${padding} ${className}`}>{children}</div>
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-ink-200 pb-4">
      <div>
        <h1 className="text-[1.75rem] font-black leading-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-500">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded border-t-4 border-brand-700 bg-white p-5 shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-sm p-1 text-ink-500 hover:bg-ink-100" aria-label="Cerrar"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="mb-5 flex flex-wrap border-b border-ink-300">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px border-b-[3px] px-4 py-2.5 text-sm ${value === t.id ? 'border-brand-700 font-bold text-ink-900' : 'border-transparent text-brand-700 hover:text-brand-900 hover:underline'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-ink-800">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  )
}

export const selectCls = 'rounded-[3px] border border-ink-400 bg-white px-3 py-2 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300'
export const inputCls = `w-full ${selectCls}`

export function Empty({ children }: { children: ReactNode }) {
  return <div className="border border-ink-200 bg-ink-50 p-8 text-center text-sm text-ink-500">{children}</div>
}

const AVATAR_COLORS = ['bg-brand-700', 'bg-cite', 'bg-purple-800', 'bg-amber-700', 'bg-red-800', 'bg-ink-600']
export function Avatar({ user, size = 32 }: { user?: User; size?: number }) {
  const color = AVATAR_COLORS[(user?.id.charCodeAt(user.id.length - 1) ?? 0) % AVATAR_COLORS.length]
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${color}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(user)}
    </span>
  )
}

export function Callout({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'success'; children: ReactNode }) {
  const cls = { info: 'border-brand-500 bg-brand-50 text-ink-900', warn: 'border-amber-500 bg-amber-50 text-ink-900', success: 'border-cite bg-green-50 text-ink-900' }[tone]
  return <div className={`border-l-[5px] px-4 py-3 text-sm ${cls}`}>{children}</div>
}
