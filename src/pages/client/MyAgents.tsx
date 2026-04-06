import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Pause, Play, Settings, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { clientAPI, type ClientAgent } from '@/lib/api'
import { toast } from 'sonner'

export default function MyAgents() {
  const [agents, setAgents] = useState<ClientAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      const data = await clientAPI.getAgents()
      setAgents(data)
    } catch (error) {
      console.error('Failed to load agents:', error)
      toast.error('Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  const handlePauseAgent = async (agentId: string, agentName: string) => {
    setActionLoading(agentId)
    try {
      await clientAPI.pauseAgent(agentId)
      toast.success(`${agentName} has been paused`)
      loadAgents()
    } catch (error) {
      console.error('Failed to pause agent:', error)
      toast.error('Failed to pause agent')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResumeAgent = async (agentId: string, agentName: string) => {
    setActionLoading(agentId)
    try {
      await clientAPI.resumeAgent(agentId)
      toast.success(`${agentName} has been resumed`)
      loadAgents()
    } catch (error) {
      console.error('Failed to resume agent:', error)
      toast.error('Failed to resume agent')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'paused':
        return 'bg-yellow-500'
      case 'provisioning':
        return 'bg-blue-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading agents...</div>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Bot className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No agents yet</h2>
        <p className="text-muted-foreground text-center mb-4">
          Contact your account manager to set up your first AI agent.
        </p>
        <Button asChild>
          <Link to="/dashboard/support">Get Help</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Agents</h1>
          <p className="text-muted-foreground mt-2">
            Manage and configure your AI agents
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.agent_id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{agent.agent_emoji}</div>
                  <div>
                    <CardTitle className="text-lg">{agent.agent_name}</CardTitle>
                    {agent.agent_role && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {agent.agent_role}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(agent.status)} text-white`}
                >
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Channel:</span>
                  <p className="font-medium capitalize">{agent.channel_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Style:</span>
                  <p className="font-medium capitalize">
                    {agent.communication_style || 'Default'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <Link to={`/dashboard/agents/${agent.agent_id}/chat`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Settings className="h-4 w-4" />
                </Button>

                {agent.status === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePauseAgent(agent.agent_id, agent.agent_name)}
                    disabled={actionLoading === agent.agent_id}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : agent.status === 'paused' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResumeAgent(agent.agent_id, agent.agent_name)}
                    disabled={actionLoading === agent.agent_id}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
