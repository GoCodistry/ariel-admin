/**
 * Authentication Context Provider
 *
 * Manages global authentication state:
 * - Current user
 * - Login/logout operations
 * - Token management
 * - Role-based access
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginCredentials, SignupData } from '@/types/auth.types'
import { authAPI, getAccessToken, setAccessToken, clearTokens, isTokenExpired } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = getAccessToken()

    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      clearTokens()
      setUser(null)
      setIsLoading(false)
      return
    }

    // Fetch current user
    try {
      const currentUser = await authAPI.me()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login(credentials)
      setAccessToken(response.access_token)
      setUser(response.user)
    } catch (error) {
      setIsLoading(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: SignupData) => {
    setIsLoading(true)
    try {
      const response = await authAPI.signup(data)
      setAccessToken(response.access_token)
      setUser(response.user)
    } catch (error) {
      setIsLoading(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    hasRole,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
