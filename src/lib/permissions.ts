import type { AccessGrant, AccessRequest, Membership, Paper, User } from './types'

export interface PermData {
  users: User[]
  memberships: Membership[]
  grants: AccessGrant[]
  requests: AccessRequest[]
}

export function getUser(d: PermData, userId: string): User | undefined {
  return d.users.find(u => u.id === userId)
}

export function activeMemberships(d: PermData, userId: string): Membership[] {
  return d.memberships.filter(m => m.userId === userId && m.status === 'active')
}

export function isGlobalAdmin(d: PermData, userId: string): boolean {
  return !!getUser(d, userId)?.isGlobalAdmin
}

export function isApproved(d: PermData, userId: string): boolean {
  return isGlobalAdmin(d, userId) || activeMemberships(d, userId).length > 0
}

export function adminLocalGroupIds(d: PermData, userId: string): string[] {
  return activeMemberships(d, userId).filter(m => m.role === 'admin_local').map(m => m.groupId)
}

export function isAdminLocalOf(d: PermData, userId: string, groupId: string): boolean {
  return adminLocalGroupIds(d, userId).includes(groupId)
}

export function isAnyAdmin(d: PermData, userId: string): boolean {
  return isGlobalAdmin(d, userId) || adminLocalGroupIds(d, userId).length > 0
}

export function canPublish(d: PermData, userId: string): boolean {
  return isGlobalAdmin(d, userId) || activeMemberships(d, userId).some(m => m.role !== 'reader')
}

export function writerGroupIds(d: PermData, userId: string): string[] {
  return activeMemberships(d, userId).filter(m => m.role !== 'reader').map(m => m.groupId)
}

export function isAuthor(paper: Paper, userId: string): boolean {
  return paper.authorIds.includes(userId)
}

export function canReview(d: PermData, userId: string, paper: Paper): boolean {
  return isGlobalAdmin(d, userId) || isAdminLocalOf(d, userId, paper.ownerGroupId)
}

export function canManagePaper(d: PermData, userId: string, paper: Paper): boolean {
  return isAuthor(paper, userId) || canReview(d, userId, paper)
}

export function canSeeMetadata(d: PermData, userId: string, paper: Paper): boolean {
  if (canManagePaper(d, userId, paper)) return true
  return isApproved(d, userId) && (paper.status === 'publicado' || paper.status === 'en_curso')
}

export function activeGrant(d: PermData, userId: string, paperId: string): AccessGrant | undefined {
  const now = Date.now()
  return d.grants.find(g => g.paperId === paperId && g.userId === userId && !g.revoked &&
    (!g.expiresAt || Date.parse(g.expiresAt) > now))
}

function readableByVisibility(d: PermData, userId: string, paper: Paper): boolean {
  if (paper.visibility === 'publica') return true
  if (paper.visibility === 'grupos') {
    return activeMemberships(d, userId).some(m => paper.visibleGroupIds.includes(m.groupId))
  }
  return false
}

export type AccessReason = 'gestor' | 'visibilidad' | 'concedido' | null

export function readAccessReason(d: PermData, userId: string, paper: Paper): AccessReason {
  if (paper.versions.length === 0) return null
  if (canManagePaper(d, userId, paper)) return 'gestor'
  if (paper.status !== 'publicado' || !isApproved(d, userId)) return null
  if (readableByVisibility(d, userId, paper)) return 'visibilidad'
  if (activeGrant(d, userId, paper.id)) return 'concedido'
  return null
}

export function canRead(d: PermData, userId: string, paper: Paper): boolean {
  return readAccessReason(d, userId, paper) !== null
}

export function canDownload(d: PermData, userId: string, paper: Paper): boolean {
  const reason = readAccessReason(d, userId, paper)
  if (reason === 'gestor') return true
  if (reason === 'visibilidad') return paper.allowDownload || !!activeGrant(d, userId, paper.id)?.allowDownload
  if (reason === 'concedido') return !!activeGrant(d, userId, paper.id)?.allowDownload
  return false
}

export function pendingRequest(d: PermData, userId: string, paperId: string): AccessRequest | undefined {
  return d.requests.find(r => r.paperId === paperId && r.requesterId === userId && r.status === 'pendiente')
}

export function canRequestAccess(d: PermData, userId: string, paper: Paper): boolean {
  return isApproved(d, userId) && paper.status === 'publicado' && paper.versions.length > 0 &&
    !canRead(d, userId, paper) && !pendingRequest(d, userId, paper.id)
}

export function canResolveRequest(d: PermData, userId: string, paper: Paper): boolean {
  return canManagePaper(d, userId, paper)
}

export function reviewerIds(d: PermData, paper: Paper): string[] {
  const admins = d.users.filter(u => u.isGlobalAdmin).map(u => u.id)
  const locals = d.memberships
    .filter(m => m.groupId === paper.ownerGroupId && m.role === 'admin_local' && m.status === 'active')
    .map(m => m.userId)
  return [...new Set([...locals, ...admins])]
}
