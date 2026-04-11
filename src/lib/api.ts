// API client for Ariel backend

import { getAccessToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Client types
export interface Client {
  client_id: string
  email: string
  first_name: string
  last_name: string
  company_name?: string
  phone?: string
  plan_tier: string
  monthly_price: number
  status: 'trial' | 'active' | 'paused' | 'cancelled' | 'suspended'
  message_limit: number
  current_period_messages: number
  created_at: string
  trial_end?: string
  agent_count?: number
}

export interface Agent {
  agent_id: string
  client_id: string
  agent_name: string
  agent_emoji: string
  agent_role?: string
  channel_type: string
  status: 'provisioning' | 'active' | 'paused' | 'error' | 'stopped'
  current_period_messages: number
  last_message_at?: string
  created_at: string
  soul_config?: any
  channel_config?: any
}

export interface Partner {
  partner_id: string
  email: string
  first_name: string
  last_name: string
  company_name?: string
  referral_code: string
  commission_rate: number
  status: 'applied' | 'approved' | 'active' | 'suspended' | 'deactivated'
  created_at: string
}

export interface Usage {
  usage_id: string
  client_id: string
  agent_id: string
  billing_period: string
  message_count: number
  inbound_count: number
  outbound_count: number
  overage_messages: number
  overage_charge: number
}

// API functions

// Clients
export const clientsAPI = {
  list: () => fetchAPI<Client[]>('/api/admin/clients'),
  get: (clientId: string) => fetchAPI<Client>(`/api/admin/clients/${clientId}`),
  create: (data: Partial<Client>) =>
    fetchAPI<Client>('/api/admin/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (clientId: string, data: Partial<Client>) =>
    fetchAPI<Client>(`/api/admin/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deactivate: (clientId: string) =>
    fetchAPI<void>(`/api/admin/clients/${clientId}/deactivate`, {
      method: 'POST',
    }),
}

// Agents
export const agentsAPI = {
  list: () => fetchAPI<Agent[]>('/api/admin/agents'),
  get: (agentId: string) => fetchAPI<Agent>(`/api/admin/agents/${agentId}`),
  listByClient: (clientId: string) =>
    fetchAPI<Agent[]>(`/api/admin/clients/${clientId}/agents`),
  create: (data: Partial<Agent>) =>
    fetchAPI<Agent>('/api/admin/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (agentId: string, data: Partial<Agent>) =>
    fetchAPI<Agent>(`/api/admin/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateSOUL: (agentId: string, soulConfig: any) =>
    fetchAPI<Agent>(`/api/admin/agents/${agentId}/soul`, {
      method: 'PUT',
      body: JSON.stringify({ soul_config: soulConfig }),
    }),
}

// Partners
export const partnersAPI = {
  list: () => fetchAPI<Partner[]>('/api/admin/partners'),
  get: (partnerId: string) => fetchAPI<Partner>(`/api/admin/partners/${partnerId}`),
  create: (data: Partial<Partner>) =>
    fetchAPI<Partner>('/api/admin/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (partnerId: string, data: Partial<Partner>) =>
    fetchAPI<Partner>(`/api/admin/partners/${partnerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Usage
export const usageAPI = {
  getByClient: (clientId: string, period?: string) =>
    fetchAPI<Usage[]>(
      `/api/admin/usage/client/${clientId}${period ? `?period=${period}` : ''}`
    ),
  getByAgent: (agentId: string, period?: string) =>
    fetchAPI<Usage[]>(
      `/api/admin/usage/agent/${agentId}${period ? `?period=${period}` : ''}`
    ),
}

// Analytics
export interface RevenueStats {
  mrr: number
  active_clients: number
  trial_clients: number
  churn_rate: number
  total_revenue_month: number
  average_revenue_per_client: number
}

export const analyticsAPI = {
  getRevenue: () => fetchAPI<RevenueStats>('/api/admin/analytics/revenue'),
}

// Admin User Management & Chat Monitoring API
export interface AdminUser {
  user_id: string
  email: string
  role: 'admin' | 'client' | 'partner'
  first_name: string
  last_name: string
  email_verified: boolean
  created_at: string
  last_login_at?: string
  login_count: number
  client_id?: string
  partner_id?: string
}

export interface ConversationMonitor {
  conversation_id: string
  client_id: string
  client_name: string
  client_email: string
  agent_id: string
  agent_name: string
  status: string
  last_message_at?: string
  unread_count: number
  message_count: number
  created_at: string
}

export interface SystemStats {
  total_users: number
  total_clients: number
  total_partners: number
  total_agents: number
  total_conversations: number
  total_messages: number
  active_conversations_today: number
  messages_today: number
}

export interface ChatActivity {
  period_days: number
  start_date: string
  messages_by_day: Array<{
    date: string
    count: number
  }>
}

export const adminAPI = {
  // User Management
  listUsers: (role?: string, search?: string) => {
    const params = new URLSearchParams()
    if (role) params.append('role', role)
    if (search) params.append('search', search)
    return fetchAPI<AdminUser[]>(`/api/admin/users?${params.toString()}`)
  },
  impersonateUser: (userId: string) =>
    fetchAPI<{
      success: boolean
      access_token: string
      token_type: string
      user: AdminUser
      message: string
    }>(`/api/admin/users/${userId}/impersonate`, {
      method: 'POST',
    }),
  deactivateUser: (userId: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/api/admin/users/${userId}/deactivate`, {
      method: 'POST',
    }),

  // Chat Monitoring
  getConversations: (limit?: number) =>
    fetchAPI<ConversationMonitor[]>(
      `/api/admin/chat/conversations${limit ? `?limit=${limit}` : ''}`
    ),
  getConversationMessages: (conversationId: string, limit?: number) =>
    fetchAPI<{
      conversation_id: string
      client_name: string
      agent_name: string
      messages: Array<{
        message_id: string
        sender_type: string
        content: string
        status: string
        sent_at: string
      }>
    }>(`/api/admin/chat/conversations/${conversationId}/messages${limit ? `?limit=${limit}` : ''}`),

  // Analytics
  getSystemStats: () => fetchAPI<SystemStats>('/api/admin/analytics/system-stats'),
  getChatActivity: (days?: number) =>
    fetchAPI<ChatActivity>(`/api/admin/analytics/chat-activity${days ? `?days=${days}` : ''}`),
}

// Client Dashboard API
export interface ClientProfile {
  client_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company_name?: string
  industry?: string
  timezone: string
  plan_tier: string
  status: string
  created_at: string
}

export interface ClientAgent {
  agent_id: string
  agent_name: string
  agent_emoji: string
  agent_role?: string
  communication_style?: string
  channel_type: string
  status: string
  created_at: string
  personality_traits?: Record<string, any>
}

export interface AgentTemplate {
  id: string
  name: string
  emoji: string
  role: string
  communication_style: string
  tagline: string
  description: string
  system_prompt: string
}

export interface IndustryBundle {
  id: string
  name: string
  emoji: string
  tagline: string
  description: string
  agent_templates: string[]
  recommended_plan: string
  industry_context: string
}

export interface AgentTemplatesResponse {
  templates: AgentTemplate[]
  bundles: IndustryBundle[]
}

export const clientAPI = {
  // Profile
  getProfile: () => fetchAPI<ClientProfile>('/api/client/profile'),
  updateProfile: (data: Partial<ClientProfile>) =>
    fetchAPI<ClientProfile>('/api/client/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Agent Templates
  getAgentTemplates: () => fetchAPI<AgentTemplatesResponse>('/api/agent-templates'),

  // Agents
  getAgents: () => fetchAPI<ClientAgent[]>('/api/client/agents'),
  getAgent: (agentId: string) => fetchAPI<ClientAgent>(`/api/client/agents/${agentId}`),
  createAgent: (data: {
    template_id: string
    agent_name?: string
    channel_type: string
    channel_config?: Record<string, any>
  }) =>
    fetchAPI<ClientAgent>('/api/client/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createAgentBundle: (data: {
    bundle_id: string
    channel_type: string
    channel_config?: Record<string, any>
  }) =>
    fetchAPI<{ agents: ClientAgent[] }>('/api/client/agents/bundle', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAgentPersonality: (agentId: string, data: {
    communication_style?: string
    personality_traits?: Record<string, number>
    hard_limits?: string[]
    role_context?: string
  }) =>
    fetchAPI<ClientAgent>(`/api/client/agents/${agentId}/personality`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  pauseAgent: (agentId: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/api/client/agents/${agentId}/pause`, {
      method: 'POST',
    }),
  resumeAgent: (agentId: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/api/client/agents/${agentId}/resume`, {
      method: 'POST',
    }),

  // Chat
  getConversations: () => fetchAPI<ConversationSummary[]>('/api/chat/conversations'),
  getOrCreateConversation: (agentId: string) =>
    fetchAPI<ConversationSummary>(`/api/chat/conversations/agent/${agentId}`),
  getConversationMessages: (conversationId: string, limit?: number) =>
    fetchAPI<ChatMessage[]>(
      `/api/chat/conversations/${conversationId}/messages${limit ? `?limit=${limit}` : ''}`
    ),
  markConversationRead: (conversationId: string) =>
    fetchAPI<{ success: boolean }>(`/api/chat/conversations/${conversationId}/read`, {
      method: 'POST',
    }),
}

export interface ConversationSummary {
  conversation_id: string
  agent_id: string
  agent_name: string
  agent_emoji: string
  status: string
  last_message_at?: string
  unread_count: number
  created_at: string
}

export interface ChatMessage {
  message_id: string
  conversation_id: string
  sender_type: 'client' | 'agent'
  content: string
  status: string
  sent_at: string
  delivered_at?: string
  read_at?: string
}

// Partner Dashboard API
export interface PartnerProfile {
  partner_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company_name?: string
  referral_code: string
  commission_rate: number
  status: string
  created_at: string
}

export interface Referral {
  referral_id: string
  client_id: string
  client_name: string
  client_email: string
  referral_code_used: string
  signup_date?: string
  client_status: string
  current_plan?: string
  current_mrr: number
  created_at: string
}

export interface Commission {
  commission_id: string
  referral_id: string
  client_name: string
  period_start: string
  period_end: string
  revenue_amount: number
  commission_rate: number
  commission_amount: number
  status: string
  paid_at?: string
}

export interface CommissionStats {
  total_earnings: number
  pending_earnings: number
  paid_earnings: number
  total_referrals: number
  active_referrals: number
  this_month_earnings: number
}

export interface Payout {
  payout_id: string
  period_start: string
  period_end: string
  gross_amount: number
  net_amount: number
  method: string
  status: string
  initiated_at?: string
  paid_at?: string
  created_at: string
}

export const partnerAPI = {
  // Profile
  getProfile: () => fetchAPI<PartnerProfile>('/api/partner/profile'),
  updateProfile: (data: Partial<PartnerProfile>) =>
    fetchAPI<PartnerProfile>('/api/partner/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Referrals
  getReferrals: (status?: string) =>
    fetchAPI<Referral[]>(`/api/partner/referrals${status ? `?status=${status}` : ''}`),
  getReferralLink: () =>
    fetchAPI<{ referral_code: string; referral_link: string; qr_code_url: string }>(
      '/api/partner/referral-link'
    ),

  // Commissions
  getCommissions: (period?: string) =>
    fetchAPI<Commission[]>(`/api/partner/commissions${period ? `?period=${period}` : ''}`),
  getCommissionStats: () => fetchAPI<CommissionStats>('/api/partner/commissions/stats'),

  // Payouts
  getPayouts: () => fetchAPI<Payout[]>('/api/partner/payouts'),
  requestPayout: () =>
    fetchAPI<{ success: boolean; message: string; payout_id: string; amount: number }>(
      '/api/partner/payouts/request',
      { method: 'POST' }
    ),

  // Resources
  getResources: () => fetchAPI<any[]>('/api/partner/resources'),
}
