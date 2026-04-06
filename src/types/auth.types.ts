/**
 * Authentication type definitions
 */

export type UserRole = 'admin' | 'client' | 'partner'

export interface User {
  user_id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  email_verified: boolean
  created_at: string
  last_login_at?: string
}

export interface AuthTokens {
  access_token: string
  token_type: 'bearer'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'client' | 'partner'
  referral_code?: string
}

export interface TokenPayload {
  sub: string  // user_id
  email: string
  role: UserRole
  exp: number
  iat: number
  type: 'access' | 'refresh'
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  new_password: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}
