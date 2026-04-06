import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { agentsAPI, clientsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Edit, Save, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>()
  const queryClient = useQueryClient()
  const [isEditingSOUL, setIsEditingSOUL] = useState(false)
  const [soulContext, setSoulContext] = useState('')

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agents', agentId],
    queryFn: () => agentsAPI.get(agentId!),
    enabled: !!agentId,
  })

  const { data: client } = useQuery({
    queryKey: ['clients', agent?.client_id],
    queryFn: () => clientsAPI.get(agent!.client_id),
    enabled: !!agent?.client_id,
  })

  const updateSOULMutation = useMutation({
    mutationFn: (soulConfig: any) => agentsAPI.updateSOUL(agentId!, soulConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', agentId] })
      setIsEditingSOUL(false)
      toast.success('SOUL configuration updated')
    },
    onError: () => {
      toast.error('Failed to update SOUL configuration')
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!agent) {
    return <div>Agent not found</div>
  }

  const handleSaveSOUL = () => {
    const newConfig = {
      ...agent.soul_config,
      context: soulContext,
    }
    updateSOULMutation.mutate(newConfig)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{agent.agent_emoji}</span>
            <div>
              <h1 className="text-3xl font-bold">{agent.agent_name}</h1>
              <p className="text-muted-foreground">{agent.agent_role || 'AI Agent'}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={agent.status === 'active' ? 'success' : 'warning'}>
            {agent.status}
          </Badge>
        </div>
      </div>

      {/* Agent Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Channel</span>
              <span className="font-medium capitalize">{agent.channel_type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{agent.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{formatDate(agent.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {client ? (
              <>
                <div className="text-sm">
                  <span className="font-medium">
                    {client.first_name} {client.last_name}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{client.email}</div>
                <Link to={`/clients/${client.client_id}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    View Client
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Loading client...</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Period</span>
              <span className="font-medium">{agent.current_period_messages}</span>
            </div>
            {agent.last_message_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Message</span>
                <span className="font-medium">{formatDate(agent.last_message_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SOUL Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>SOUL Configuration</CardTitle>
            {!isEditingSOUL ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditingSOUL(true)
                  setSoulContext(agent.soul_config?.context || '')
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingSOUL(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveSOUL}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingSOUL ? (
            <div className="space-y-4">
              <div>
                <Label>Context / System Prompt</Label>
                <textarea
                  value={soulContext}
                  onChange={(e) => setSoulContext(e.target.value)}
                  className="w-full h-64 mt-2 p-4 border rounded-md font-mono text-sm"
                  placeholder="Enter agent context and instructions..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Context</h4>
                <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                  {agent.soul_config?.context || 'No context configured'}
                </pre>
              </div>
              {agent.soul_config?.personality_traits && (
                <div>
                  <h4 className="font-medium mb-2">Personality Traits</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {Object.entries(agent.soul_config.personality_traits).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
