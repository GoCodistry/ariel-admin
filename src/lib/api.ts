// API client for Ariel backend

import { getAccessToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://3.223.102.157:8000'

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

export const clientAPI = {
  // Profile
  getProfile: () => fetchAPI<ClientProfile>('/api/client/profile'),
  updateProfile: (data: Partial<ClientProfile>) =>
    fetchAPI<ClientProfile>('/api/client/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Agents
  getAgents: () => fetchAPI<ClientAgent[]>('/api/client/agents'),
  getAgent: (agentId: string) => fetchAPI<ClientAgent>(`/api/client/agents/${agentId}`),
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
}
