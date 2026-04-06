import { useEffect, useRef, useCallback } from 'react'
import { useChat } from '@/hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ChatInterfaceProps {
  agentId: string
  className?: string
}

export function ChatInterface({ agentId, className = '' }: ChatInterfaceProps) {
  const {
    messages,
    agentInfo,
    isConnected,
    isTyping,
    isLoadingHistory,
    sendMessage,
  } = useChat({ agentId })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive or typing status changes
  const scrollToBottom = useCallback(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }, [])

  // Scroll when messages change, typing status changes, or history finishes loading
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Scroll to bottom when history finishes loading (returning to chat)
  useEffect(() => {
    if (!isLoadingHistory && messages.length > 0) {
      // Use instant scroll (no animation) when loading history
      requestAnimationFrame(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'instant' })
        }
      })
    }
  }, [isLoadingHistory, messages.length])

  const handleSendMessage = (content: string) => {
    const success = sendMessage(content)
    if (!success) {
      console.error('Failed to send message')
      return
    }

    // Immediately scroll to show the user's message
    setTimeout(scrollToBottom, 0)
  }

  if (isLoadingHistory) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="mb-4 text-4xl">{agentInfo?.emoji || '🤖'}</div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Connection status */}
      {!isConnected && (
        <Alert variant="destructive" className="mb-4">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Disconnected. Trying to reconnect...
          </AlertDescription>
        </Alert>
      )}

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">{agentInfo?.emoji || '🤖'}</div>
            <h3 className="text-xl font-semibold mb-2">
              Chat with {agentInfo?.name || 'your agent'}
            </h3>
            <p className="text-muted-foreground max-w-md">
              Start a conversation! Your messages will be delivered in real-time.
            </p>
          </div>
        )}

        {/* Render messages in chronological order (oldest to newest) */}
        {messages.map((message) => (
          <MessageBubble
            key={message.message_id}
            message={message}
            agentEmoji={agentInfo?.emoji}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator agentEmoji={agentInfo?.emoji} />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t bg-background p-4">
        <MessageInput
          onSend={handleSendMessage}
          disabled={!isConnected}
          placeholder={
            isConnected
              ? 'Type a message...'
              : 'Connecting...'
          }
        />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Connecting...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
