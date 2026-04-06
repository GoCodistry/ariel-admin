import { cn } from '@/lib/utils'
import { ChatMessage } from '@/hooks/useChat'

interface MessageBubbleProps {
  message: ChatMessage
  agentEmoji?: string
}

export function MessageBubble({ message, agentEmoji = '🤖' }: MessageBubbleProps) {
  const isAgent = message.sender_type === 'agent'
  const time = new Date(message.sent_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div
      className={cn(
        'flex items-end gap-2 max-w-[80%]',
        isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'
      )}
    >
      {/* Avatar */}
      {isAgent && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
          {agentEmoji}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'rounded-2xl px-4 py-2 break-words',
          isAgent
            ? 'bg-muted text-foreground rounded-bl-none'
            : 'bg-primary text-primary-foreground rounded-br-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div
          className={cn(
            'text-xs mt-1',
            isAgent ? 'text-muted-foreground' : 'text-primary-foreground/70'
          )}
        >
          {time}
        </div>
      </div>
    </div>
  )
}
