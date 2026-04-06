/**
 * Chat Hook
 *
 * High-level hook for managing chat state:
 * - Loads message history
 * - Integrates with WebSocket
 * - Manages typing indicators
 * - Handles send/receive messages
 */

import { useState, useEffect, useCallback } from 'react'
import { useWebSocket, WebSocketMessage } from './useWebSocket'
import { clientAPI } from '@/lib/api'

export interface ChatMessage {
  message_id: string
  sender_type: 'client' | 'agent'
  content: string
  sent_at: string
  status: string
}

interface UseChatOptions {
  agentId: string
  conversationId?: string
}

export function useChat({ agentId, conversationId: initialConversationId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null)
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [agentInfo, setAgentInfo] = useState<{ name: string; emoji: string } | null>(null)

  // WebSocket connection
  const { isConnected, sendMessage: wsSendMessage } = useWebSocket({
    agentId,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('Chat connected')
    },
  })

  // Handle incoming WebSocket messages
  function handleWebSocketMessage(wsMessage: WebSocketMessage) {
    if (wsMessage.type === 'connected') {
      setConversationId(wsMessage.conversation_id || null)
      setAgentInfo({
        name: wsMessage.agent_name || 'Agent',
        emoji: wsMessage.agent_emoji || '🤖',
      })
    } else if (wsMessage.type === 'message') {
      // Add message to the list
      setMessages((prev) => [
        {
          message_id: wsMessage.message_id!,
          sender_type: wsMessage.sender_type!,
          content: wsMessage.content!,
          sent_at: wsMessage.sent_at!,
          status: wsMessage.status || 'sent',
        },
        ...prev,
      ])

      // Stop typing indicator if it was an agent message
      if (wsMessage.sender_type === 'agent') {
        setIsTyping(false)
      }
    } else if (wsMessage.type === 'typing') {
      setIsTyping(true)
    }
  }

  // Load conversation and message history
  useEffect(() => {
    loadHistory()
  }, [agentId])

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true)

      // Get or create conversation
      const conv = await clientAPI.getOrCreateConversation(agentId)
      setConversationId(conv.conversation_id)
      setAgentInfo({
        name: conv.agent_name,
        emoji: conv.agent_emoji,
      })

      // Load message history
      const history = await clientAPI.getConversationMessages(conv.conversation_id)

      // Reverse to show oldest first (API returns newest first)
      setMessages(history.reverse())

      // Mark as read
      await clientAPI.markConversationRead(conv.conversation_id)
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return false

      const success = wsSendMessage(content.trim())

      if (!success) {
        console.error('Failed to send message - not connected')
        return false
      }

      return true
    },
    [wsSendMessage]
  )

  return {
    messages,
    conversationId,
    agentInfo,
    isConnected,
    isTyping,
    isLoadingHistory,
    sendMessage,
    refresh: loadHistory,
  }
}
