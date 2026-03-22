export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  createdAt: string
  updatedAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export type InstanceStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected'

export interface WhatsAppInstance {
  id: string
  userId: string
  name: string
  phoneNumber?: string | null
  profileName?: string | null
  profilePic?: string | null
  status: InstanceStatus
  createdAt: string
  updatedAt: string
}

export interface InstanceStatusUpdate {
  instanceId: string
  status: InstanceStatus
  qr?: string
}

export type TriggerType = 'keyword' | 'any_message' | 'first_message' | 'button_reply' | 'list_reply'

export interface FlowTrigger {
  type: TriggerType
  value?: string
  instanceId?: string
}

export type NodeType =
  | 'trigger'
  | 'text_message'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'delay'
  | 'condition'
  | 'tag_action'
  | 'save_variable'
  | 'webhook'
  | 'end'

export interface FlowNodeData {
  label: string
  [key: string]: unknown
}

export interface FlowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: FlowNodeData
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  label?: string
}

export interface Flow {
  id: string
  userId: string
  name: string
  description?: string | null
  isActive: boolean
  trigger: FlowTrigger
  nodes: FlowNode[]
  edges: FlowEdge[]
  createdAt: string
  updatedAt: string
  executionCount?: number
}

export type ExecutionStatus = 'running' | 'completed' | 'failed'

export interface FlowExecution {
  id: string
  flowId: string
  contactId: string
  status: ExecutionStatus
  currentNode?: string | null
  context?: Record<string, unknown> | null
  startedAt: string
  completedAt?: string | null
  contact?: { id: string; phone: string; name?: string | null }
}

export interface Contact {
  id: string
  userId: string
  phone: string
  name?: string | null
  email?: string | null
  tags: string[]
  variables?: Record<string, unknown> | null
  optOut: boolean
  createdAt: string
  updatedAt: string
}

export interface ContactsResponse {
  contacts: Contact[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'received'

export interface MessageContent {
  text?: string
  url?: string
  caption?: string
  filename?: string
  [key: string]: unknown
}

export interface Message {
  id: string
  instanceId: string
  contactId?: string | null
  direction: MessageDirection
  type: string
  content: MessageContent
  status: MessageStatus
  sentAt?: string | null
  createdAt: string
  contact?: { id: string; phone: string; name?: string | null } | null
  instance?: { id: string; name: string } | null
}

export interface Webhook {
  id: string
  userId: string
  name: string
  url: string
  secret?: string | null
  events: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WebhookLog {
  id: string
  webhookId: string
  event: string
  payload: Record<string, unknown>
  statusCode?: number | null
  response?: string | null
  success: boolean
  createdAt: string
}

export interface WebhookEvent {
  event: string
  description: string
}

export interface DashboardStats {
  totalFlows: number
  activeFlows: number
  totalExecutions: number
  recentExecutions: Array<{ startedAt: string; status: string }>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
