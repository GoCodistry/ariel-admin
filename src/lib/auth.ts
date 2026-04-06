/**
 * Frontend Authentication Utilities
 *
 * Handles:
 * - Token storage in localStorage
 * - API calls for auth endpoints
 * - Token decoding
 */

import {
  User,
  LoginCredentials,
  SignupData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
} from '@/types/auth.types'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'ariel_access_token'

// ============================================================================
// TOKEN STORAGE
// ============================================================================

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setAccessToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

// ============================================================================
// TOKEN DECODING (without verification - just reading payload)
// ============================================================================

export const decodeToken = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) return true

  // Check if token is expired (with 30 second buffer)
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now + 30
}

// ============================================================================
// AUTH API CALLS
// ============================================================================

export const authAPI = {
  /**
   * Sign up new user
   */
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Signup failed')
    }

    return response.json()
  },

  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }

    return response.json()
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    const token = getAccessToken()
    if (!token) return

    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error('Logout failed')
    }

    clearTokens()
  },

  /**
   * Get current user information
   */
  me: async (): Promise<User> => {
    const token = getAccessToken()
    if (!token) {
      throw new Error('No access token')
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Request failed')
    }

    return response.json()
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Reset failed')
    }

    return response.json()
  },

  /**
   * Change password for logged-in user
   */
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const token = getAccessToken()
    if (!token) {
      throw new Error('No access token')
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Change password failed')
    }

    return response.json()
  },
}
