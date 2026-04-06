import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { clientAPI, ClientAgent } from '@/lib/api'
import { toast } from 'sonner'

export default function AgentChat() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<ClientAgent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAgent()
  }, [agentId])

  const loadAgent = async () => {
    if (!agentId) return

    try {
      const data = await clientAPI.getAgent(agentId)
      setAgent(data)
    } catch (error) {
      console.error('Failed to load agent:', error)
      toast.error('Failed to load agent')
      navigate('/dashboard/agents')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading agent...</div>
      </div>
    )
  }

  if (!agent || !agentId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Agent not found</p>
          <Button onClick={() => navigate('/dashboard/agents')}>
            Back to Agents
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/agents')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{agent.agent_emoji}</div>
            <div>
              <h1 className="text-xl font-bold">{agent.agent_name}</h1>
              {agent.agent_role && (
                <p className="text-sm text-muted-foreground">
                  {agent.agent_role}
                </p>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/dashboard/agents/${agentId}/configure`)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Chat interface */}
      <div className="flex-1 min-h-0">
        <ChatInterface agentId={agentId} className="h-full" />
      </div>
    </div>
  )
}
