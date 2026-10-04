import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clear as clearBlobs } from 'idb-keyval'
import { buildSeed, type DemoData } from './seed'
import { reviewerIds } from './permissions'
import { fullName, shortTitle } from './format'
import type { Group, Paper, PaperVersion, Role, User } from './types'

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`
const now = () => new Date().toISOString()

export interface NewPaperInput {
  title: string
  abstract: string
  language: Paper['language']
  topicIds: string[]
  keywords: string[]
  authorIds: string[]
  ownerGroupId: string
  visibility: Paper['visibility']
  visibleGroupIds: string[]
  allowDownload: boolean
  estimatedDate?: string
}

interface Actions {
  setCurrentUser: (id: string) => void
  resetDemo: () => Promise<void>
  register: (input: { firstName: string; lastName: string; email: string; collegiateNumber: string; groupIds: string[] }) => string
  requestMembership: (groupId: string) => void
  resolveMembership: (membershipId: string, approve: boolean, role: Role) => void
  setMemberRole: (membershipId: string, role: Role) => void
  removeMembership: (membershipId: string) => void
  addMember: (userId: string, groupId: string, role: Role) => void
  createGroup: (input: Omit<Group, 'id'>) => void
  addTopic: (category: string, name: string) => void
  removeTopic: (topicId: string) => void
  createPaper: (input: NewPaperInput) => string
  updatePaper: (paperId: string, patch: Partial<Paper>) => void
  submitForReview: (paperId: string, version: Omit<PaperVersion, 'version'>) => void
  approvePaper: (paperId: string) => void
  returnPaper: (paperId: string, comment: string) => void
  withdrawPaper: (paperId: string) => void
  requestAccess: (paperId: string, message: string) => void
  resolveRequest: (requestId: string, accept: boolean, opts: { expiresInDays?: number; allowDownload: boolean; responseMessage: string }) => void
  revokeGrant: (grantId: string) => void
  openConversation: (otherUserId: string, ctx?: { paperId?: string; requestId?: string }) => string
  sendMessage: (conversationId: string, text: string) => void
  logEvent: (paperId: string, type: 'view' | 'download') => void
  markNotificationsRead: () => void
  updateProfile: (patch: Partial<User>) => void
}

export type State = DemoData & { currentUserId: string } & Actions

const initialData = () => ({ ...buildSeed(), currentUserId: 'u-lucia' })

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const me = () => get().currentUserId
      const userName = (id: string) => fullName(get().users.find(u => u.id === id))
      const paperOf = (id: string) => get().papers.find(p => p.id === id)!
      const groupName = (id: string) => get().groups.find(g => g.id === id)?.name ?? id

      const notify = (userIds: string[], text: string, link?: string) =>
        set(s => ({
          notifications: [
            ...[...new Set(userIds)].filter(id => id !== s.currentUserId)
              .map(userId => ({ id: uid('n'), userId, text, link, createdAt: now(), read: false })),
            ...s.notifications,
          ],
        }))

      const log = (action: string, detail: string) =>
        set(s => ({ audit: [{ id: uid('l'), actorId: s.currentUserId, action, detail, at: now() }, ...s.audit] }))

      const groupAdmins = (groupId: string) => {
        const s = get()
        const locals = s.memberships.filter(m => m.groupId === groupId && m.role === 'admin_local' && m.status === 'active').map(m => m.userId)
        return locals.length ? locals : s.users.filter(u => u.isGlobalAdmin).map(u => u.id)
      }

      const topicFollowers = (paper: Paper) =>
        get().users.filter(u => u.followedTopics.some(t => paper.topicIds.includes(t)) && !paper.authorIds.includes(u.id)).map(u => u.id)

      return {
        ...initialData(),

        setCurrentUser: id => set({ currentUserId: id }),

        resetDemo: async () => {
          await clearBlobs()
          set(initialData())
        },

        register: input => {
          const id = uid('u')
          const user: User = {
            id, firstName: input.firstName, lastName: input.lastName, email: input.email,
            collegiateNumber: input.collegiateNumber, isGlobalAdmin: false, showEmail: false, showPhone: false,
            followedTopics: [], createdAt: now(), persona: 'Registro nuevo (demo)',
          }
          set(s => ({
            users: [...s.users, user],
            memberships: [...s.memberships, ...input.groupIds.map(groupId => ({
              id: uid('m'), userId: id, groupId, role: 'writer' as Role, status: 'pending' as const, requestedAt: now(),
            }))],
            currentUserId: id,
          }))
          for (const g of input.groupIds) notify(groupAdmins(g), `${fullName(user)} solicita unirse a ${groupName(g)}`, '/admin')
          return id
        },

        requestMembership: groupId => {
          set(s => ({
            memberships: [...s.memberships, { id: uid('m'), userId: s.currentUserId, groupId, role: 'writer', status: 'pending', requestedAt: now() }],
          }))
          notify(groupAdmins(groupId), `${userName(me())} solicita unirse a ${groupName(groupId)}`, '/admin')
        },

        resolveMembership: (membershipId, approve, role) => {
          const m = get().memberships.find(x => x.id === membershipId)!
          set(s => ({
            memberships: s.memberships.map(x => x.id === membershipId
              ? { ...x, status: approve ? 'active' : 'rejected', role, resolvedAt: now(), resolvedBy: s.currentUserId } : x),
          }))
          notify([m.userId], approve
            ? `Tu alta en ${groupName(m.groupId)} ha sido aprobada como ${role === 'reader' ? 'Reader' : 'Writer'}. ¡Bienvenido/a!`
            : `Tu solicitud de alta en ${groupName(m.groupId)} ha sido rechazada.`, '/')
          log(approve ? 'Alta aprobada' : 'Alta rechazada', `${userName(m.userId)} → ${groupName(m.groupId)}`)
        },

        setMemberRole: (membershipId, role) => {
          const m = get().memberships.find(x => x.id === membershipId)!
          set(s => ({ memberships: s.memberships.map(x => x.id === membershipId ? { ...x, role } : x) }))
          log('Rol cambiado', `${userName(m.userId)} → ${role} en ${groupName(m.groupId)}`)
        },

        removeMembership: membershipId => {
          const m = get().memberships.find(x => x.id === membershipId)!
          set(s => ({ memberships: s.memberships.filter(x => x.id !== membershipId) }))
          log('Miembro eliminado', `${userName(m.userId)} de ${groupName(m.groupId)}`)
        },

        addMember: (userId, groupId, role) => {
          set(s => ({
            memberships: [...s.memberships, { id: uid('m'), userId, groupId, role, status: 'active', requestedAt: now(), resolvedAt: now(), resolvedBy: s.currentUserId }],
          }))
          notify([userId], `Te han añadido a ${groupName(groupId)}`, '/perfil')
          log('Miembro añadido', `${userName(userId)} → ${groupName(groupId)} (${role})`)
        },

        createGroup: input => {
          set(s => ({ groups: [...s.groups, { ...input, id: uid('g') }] }))
          log('Grupo creado', input.name)
        },

        addTopic: (category, name) => {
          set(s => ({ topics: [...s.topics, { id: uid('t'), category, name }] }))
          log('Tema añadido', `${category} › ${name}`)
        },

        removeTopic: topicId => {
          const t = get().topics.find(x => x.id === topicId)
          set(s => ({ topics: s.topics.filter(x => x.id !== topicId) }))
          if (t) log('Tema eliminado', `${t.category} › ${t.name}`)
        },

        createPaper: input => {
          const id = uid('p')
          const paper: Paper = { ...input, id, status: 'en_curso', versions: [], createdAt: now(), updatedAt: now() }
          set(s => ({ papers: [paper, ...s.papers] }))
          notify(input.authorIds, `${userName(me())} te ha añadido como co-autor/a de «${shortTitle(paper.title)}»`, `/papers/${id}`)
          notify(topicFollowers(paper), `Nuevo trabajo en curso en un tema que sigues: «${shortTitle(paper.title)}»`, `/papers/${id}`)
          return id
        },

        updatePaper: (paperId, patch) => {
          set(s => ({ papers: s.papers.map(p => p.id === paperId ? { ...p, ...patch, updatedAt: now() } : p) }))
          if ('visibility' in patch || 'allowDownload' in patch) log('Paper modificado', `«${shortTitle(paperOf(paperId).title)}»`)
        },

        submitForReview: (paperId, version) => {
          set(s => ({
            papers: s.papers.map(p => p.id === paperId ? {
              ...p, status: 'en_revision', reviewComment: undefined, updatedAt: now(),
              versions: [...p.versions, { ...version, version: p.versions.length + 1 }],
            } : p),
          }))
          const paper = paperOf(paperId)
          notify(paper.authorIds, `Tu paper «${shortTitle(paper.title)}» se está procesando: está en revisión y te avisaremos cuando se publique.`, `/papers/${paperId}`)
          notify(reviewerIds(get(), paper), `Nuevo paper pendiente de revisión: «${shortTitle(paper.title)}»`, '/revision')
        },

        approvePaper: paperId => {
          set(s => ({ papers: s.papers.map(p => p.id === paperId ? { ...p, status: 'publicado', publishedAt: now(), updatedAt: now() } : p) }))
          const paper = paperOf(paperId)
          notify(paper.authorIds, `¡Tu paper «${shortTitle(paper.title)}» ha sido aprobado y publicado!`, `/papers/${paperId}`)
          notify(topicFollowers(paper), `Nuevo paper publicado en un tema que sigues: «${shortTitle(paper.title)}»`, `/papers/${paperId}`)
          log('Paper aprobado', `«${shortTitle(paper.title)}»`)
        },

        returnPaper: (paperId, comment) => {
          set(s => ({ papers: s.papers.map(p => p.id === paperId ? { ...p, status: 'devuelto', reviewComment: comment, updatedAt: now() } : p) }))
          const paper = paperOf(paperId)
          notify(paper.authorIds, `Tu paper «${shortTitle(paper.title)}» ha sido devuelto con comentarios del revisor.`, `/papers/${paperId}`)
          log('Paper devuelto', `«${shortTitle(paper.title)}»: ${comment}`)
        },

        withdrawPaper: paperId => {
          set(s => ({ papers: s.papers.map(p => p.id === paperId ? { ...p, status: 'retirado', updatedAt: now() } : p) }))
          const paper = paperOf(paperId)
          notify(paper.authorIds, `El paper «${shortTitle(paper.title)}» ha sido retirado.`, `/papers/${paperId}`)
          log('Paper retirado', `«${shortTitle(paper.title)}»`)
        },

        requestAccess: (paperId, message) => {
          set(s => ({
            requests: [{ id: uid('r'), paperId, requesterId: s.currentUserId, message, status: 'pendiente', createdAt: now() }, ...s.requests],
          }))
          const paper = paperOf(paperId)
          notify([...paper.authorIds, ...groupAdmins(paper.ownerGroupId)],
            `${userName(me())} ha solicitado acceso a «${shortTitle(paper.title)}»`, '/solicitudes')
        },

        resolveRequest: (requestId, accept, opts) => {
          const r = get().requests.find(x => x.id === requestId)!
          const paper = paperOf(r.paperId)
          const expiresAt = opts.expiresInDays ? new Date(Date.now() + opts.expiresInDays * 86_400_000).toISOString() : undefined
          set(s => ({
            requests: s.requests.map(x => x.id === requestId
              ? { ...x, status: accept ? 'aceptada' : 'denegada', resolvedAt: now(), resolvedBy: s.currentUserId, responseMessage: opts.responseMessage } : x),
            grants: accept ? [...s.grants, {
              id: uid('a'), paperId: r.paperId, userId: r.requesterId, expiresAt, allowDownload: opts.allowDownload,
              grantedBy: s.currentUserId, grantedAt: now(), revoked: false,
            }] : s.grants,
          }))
          const duration = opts.expiresInDays ? `${opts.expiresInDays} días` : 'permanente'
          notify([r.requesterId], accept
            ? `${userName(me())} ha aceptado tu solicitud de acceso a «${shortTitle(paper.title)}» (${duration})`
            : `${userName(me())} ha denegado tu solicitud de acceso a «${shortTitle(paper.title)}»`, `/papers/${paper.id}`)
          log(accept ? 'Acceso concedido' : 'Solicitud denegada',
            `${userName(r.requesterId)} → «${shortTitle(paper.title)}»${accept ? ` (${duration}, ${opts.allowDownload ? 'con' : 'sin'} descarga)` : ''}`)
        },

        revokeGrant: grantId => {
          const g = get().grants.find(x => x.id === grantId)!
          set(s => ({ grants: s.grants.map(x => x.id === grantId ? { ...x, revoked: true } : x) }))
          const paper = paperOf(g.paperId)
          notify([g.userId], `Se ha revocado tu acceso a «${shortTitle(paper.title)}»`, `/papers/${paper.id}`)
          log('Acceso revocado', `${userName(g.userId)} → «${shortTitle(paper.title)}»`)
        },

        openConversation: (otherUserId, ctx) => {
          const s = get()
          const existing = s.conversations.find(c => c.participantIds.includes(s.currentUserId) && c.participantIds.includes(otherUserId) &&
            (!ctx?.paperId || c.paperId === ctx.paperId))
          if (existing) return existing.id
          const id = uid('c')
          set(st => ({
            conversations: [{ id, participantIds: [st.currentUserId, otherUserId], paperId: ctx?.paperId, requestId: ctx?.requestId, createdAt: now() }, ...st.conversations],
          }))
          return id
        },

        sendMessage: (conversationId, text) => {
          const c = get().conversations.find(x => x.id === conversationId)!
          set(s => ({ messages: [...s.messages, { id: uid('x'), conversationId, senderId: s.currentUserId, text, sentAt: now() }] }))
          const other = c.participantIds.find(id => id !== me())!
          notify([other], `Nuevo mensaje de ${userName(me())}: «${shortTitle(text, 60)}»`, `/chat?c=${conversationId}`)
        },

        logEvent: (paperId, type) =>
          set(s => ({ events: [...s.events, { paperId, userId: s.currentUserId, type, at: now() }] })),

        markNotificationsRead: () =>
          set(s => ({ notifications: s.notifications.map(n => n.userId === s.currentUserId ? { ...n, read: true } : n) })),

        updateProfile: patch =>
          set(s => ({ users: s.users.map(u => u.id === s.currentUserId ? { ...u, ...patch } : u) })),
      }
    },
    {
      name: 'vetsdb-poc-v1',
      partialize: s => {
        const { users, groups, memberships, topics, papers, requests, grants, conversations, messages, notifications, events, audit, currentUserId } = s
        return { users, groups, memberships, topics, papers, requests, grants, conversations, messages, notifications, events, audit, currentUserId }
      },
    },
  ),
)

export function useMe(): User {
  const s = useStore()
  return s.users.find(u => u.id === s.currentUserId) ?? s.users[0]
}
