import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock, Send } from 'lucide-react'
import { useMe, useStore } from '../lib/store'
import { isApproved } from '../lib/permissions'
import { fmtRelative, fullName, shortTitle } from '../lib/format'
import { Avatar, Button, Card, Empty, inputCls, PageHeader, selectCls } from '../components/ui'

export function ChatPage() {
  const s = useStore()
  const me = useMe()
  const [params, setParams] = useSearchParams()
  const [text, setText] = useState('')
  const [newWith, setNewWith] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const convs = s.conversations.filter(c => c.participantIds.includes(me.id))
    .map(c => ({ c, last: s.messages.filter(m => m.conversationId === c.id).at(-1) }))
    .sort((a, b) => (b.last?.sentAt ?? b.c.createdAt).localeCompare(a.last?.sentAt ?? a.c.createdAt))
  const activeId = params.get('c') ?? convs[0]?.c.id
  const active = convs.find(x => x.c.id === activeId)?.c
  const other = active && s.users.find(u => u.id === active.participantIds.find(id => id !== me.id))
  const paper = active?.paperId ? s.papers.find(p => p.id === active.paperId) : undefined
  const messages = s.messages.filter(m => m.conversationId === activeId)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length, activeId])

  const send = () => {
    if (!activeId || !text.trim()) return
    s.sendMessage(activeId, text.trim())
    setText('')
  }

  const contacts = s.users.filter(u => u.id !== me.id && isApproved(s, u.id)).sort((a, b) => fullName(a).localeCompare(fullName(b)))

  return (
    <div>
      <PageHeader title="Chat" subtitle={<span className="flex items-center gap-1"><Lock size={13} />Conversaciones privadas 1:1. Ningún admin puede leerlas.</span>} />
      <div className="grid h-[70vh] gap-4 md:grid-cols-3">
        <Card className="flex flex-col overflow-hidden p-0">
          <div className="flex gap-2 border-b border-ink-100 p-3">
            <select value={newWith} onChange={e => setNewWith(e.target.value)} className={`${selectCls} min-w-0 flex-1 py-1.5`}>
              <option value="">Nueva conversación con…</option>
              {contacts.map(u => <option key={u.id} value={u.id}>{fullName(u)}</option>)}
            </select>
            <Button size="sm" disabled={!newWith} onClick={() => { setParams({ c: s.openConversation(newWith) }); setNewWith('') }}>Abrir</Button>
          </div>
          <div className="flex-1 overflow-auto">
            {convs.length === 0 && <p className="p-4 text-sm text-ink-500">Sin conversaciones.</p>}
            {convs.map(({ c, last }) => {
              const u = s.users.find(x => x.id === c.participantIds.find(id => id !== me.id))
              return (
                <button key={c.id} onClick={() => setParams({ c: c.id })}
                  className={`flex w-full items-center gap-3 border-b border-ink-50 px-3 py-3 text-left ${c.id === activeId ? 'bg-brand-50' : 'hover:bg-ink-50'}`}>
                  <Avatar user={u} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{fullName(u)}</p>
                    <p className="truncate text-xs text-ink-500">{last?.text ?? 'Nueva conversación'}</p>
                  </div>
                  {last && <span className="shrink-0 text-[10px] text-ink-400">{fmtRelative(last.sentAt)}</span>}
                </button>
              )
            })}
          </div>
        </Card>
        <Card className="flex flex-col overflow-hidden p-0 md:col-span-2">
          {!active ? <div className="p-6"><Empty>Selecciona o inicia una conversación.</Empty></div> : <>
            <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
              <Avatar user={other} />
              <div>
                <p className="font-bold">{fullName(other)}</p>
                {paper && <p className="text-xs text-ink-500">Sobre: <Link to={`/papers/${paper.id}`} className="text-brand-700 hover:underline">{shortTitle(paper.title, 70)}</Link></p>}
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-auto bg-ink-50 p-4">
              {messages.length === 0 && <p className="text-center text-sm text-ink-400">Escribe el primer mensaje.</p>}
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.senderId === me.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded px-3.5 py-2 text-sm ${m.senderId === me.id ? 'bg-brand-700 text-white' : 'border border-ink-200 bg-white text-ink-800'}`}>
                    {m.text}
                    <span className={`mt-0.5 block text-[10px] ${m.senderId === me.id ? 'text-brand-100' : 'text-ink-400'}`}>{fmtRelative(m.sentAt)}</span>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="flex gap-2 border-t border-ink-100 p-3">
              <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                className={inputCls} placeholder="Escribe un mensaje (solo texto, sin adjuntos)" />
              <Button onClick={send} disabled={!text.trim()}><Send size={15} /></Button>
            </div>
          </>}
        </Card>
      </div>
    </div>
  )
}
