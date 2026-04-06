/**
 * WebSocket Hook for Real-time Chat
 *
 * Manages WebSocket connection lifecycle:
 * - Connects with JWT authentication
 * - Auto-reconnects on disconnect
 * - Handles incoming messages
 * - Provides send message function
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { getAccessToken } from '@/lib/auth'

const WS_BASE_URL = import.meta.env.VITE_WS_URL || (
  typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    : 'ws://localhost:8000'
)

export interface WebSocketMessage {
  type: 'connected' | 'message' | 'typing' | 'error' | 'pong'
  message_id?: string
  sender_type?: 'client' | 'agent'
  content?: string
  sent_at?: string
  status?: string
  conversation_id?: string
  agent_name?: string
  agent_emoji?: string
  message?: string
}

interface UseWebSocketOptions {
  agentId: string
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket({
  agentId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 5

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    const token = getAccessToken()
    if (!token) {
      console.error('No access token available for WebSocket connection')
      return
    }

    setIsConnecting(true)

    const wsUrl = `${WS_BASE_URL}/ws/chat/${agentId}?token=${token}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      setIsConnecting(false)
      reconnectAttemptsRef.current = 0
      onConnect?.()

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000)

      ws.addEventListener('close', () => {
        clearInterval(pingInterval)
      })
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage
        onMessage?.(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      onError?.(error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
      setIsConnecting(false)
      onDisconnect?.()

      // Auto-reconnect with exponential backoff
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
        console.log(`Reconnecting in ${delay}ms...`)

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++
          connect()
        }, delay)
      } else {
        console.error('Max reconnect attempts reached')
      }
    }

    wsRef.current = ws
  }, [agentId, onMessage, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    reconnectAttemptsRef.current = 0
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'message',
          content,
        })
      )
      return true
    }
    return false
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId])

  return {
    isConnected,
    isConnecting,
    sendMessage,
    reconnect: connect,
    disconnect,
  }
}
