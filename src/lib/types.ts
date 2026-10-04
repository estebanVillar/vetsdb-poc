export type Role = 'reader' | 'writer' | 'admin_local'
export type MembershipStatus = 'pending' | 'active' | 'rejected'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  collegiateNumber?: string
  isGlobalAdmin: boolean
  showEmail: boolean
  showPhone: boolean
  followedTopics: string[]
  createdAt: string
  persona?: string
}

export interface Group {
  id: string
  name: string
  kind: 'colegio' | 'comunidad' | 'trabajo'
  description: string
}

export interface Membership {
  id: string
  userId: string
  groupId: string
  role: Role
  status: MembershipStatus
  requestedAt: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface Topic {
  id: string
  category: string
  name: string
}

export type PaperStatus = 'en_curso' | 'en_revision' | 'devuelto' | 'publicado' | 'retirado'
export type Visibility = 'publica' | 'grupos' | 'privada'

export interface PaperVersion {
  version: number
  fileUrl?: string
  blobKey?: string
  fileName: string
  uploadedAt: string
}

export interface ExternalSource {
  authors: string
  journal: string
  doi: string
  license: string
  url: string
}

export interface Paper {
  id: string
  title: string
  abstract: string
  language: 'es' | 'en' | 'ca' | 'eu' | 'gl'
  topicIds: string[]
  keywords: string[]
  authorIds: string[]
  ownerGroupId: string
  status: PaperStatus
  visibility: Visibility
  visibleGroupIds: string[]
  allowDownload: boolean
  versions: PaperVersion[]
  estimatedDate?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  reviewComment?: string
  external?: ExternalSource
}

export type RequestStatus = 'pendiente' | 'aceptada' | 'denegada'

export interface AccessRequest {
  id: string
  paperId: string
  requesterId: string
  message: string
  status: RequestStatus
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
  responseMessage?: string
}

export interface AccessGrant {
  id: string
  paperId: string
  userId: string
  expiresAt?: string
  allowDownload: boolean
  grantedBy: string
  grantedAt: string
  revoked: boolean
}

export interface Conversation {
  id: string
  participantIds: [string, string]
  paperId?: string
  requestId?: string
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  sentAt: string
}

export interface Notification {
  id: string
  userId: string
  text: string
  link?: string
  createdAt: string
  read: boolean
}

export interface PaperEvent {
  paperId: string
  userId: string
  type: 'view' | 'download'
  at: string
}

export interface AuditEntry {
  id: string
  actorId: string
  action: string
  detail: string
  at: string
}
