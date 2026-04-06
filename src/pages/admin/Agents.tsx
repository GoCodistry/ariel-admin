import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { agentsAPI, Agent } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function Agents() {
  const [search, setSearch] = useState('')

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsAPI.list,
  })

  const filteredAgents = agents?.filter((agent) =>
    agent.agent_name.toLowerCase().includes(search.toLowerCase()) ||
    agent.agent_role?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: Agent['status']) => {
    const variants: Record<Agent['status'], 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
      active: 'success',
      provisioning: 'warning',
      paused: 'secondary',
      error: 'destructive',
      stopped: 'secondary',
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  if (isLoading) {
    return <div>Loading agents...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">
            View and manage AI agents across all clients
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Provision Agent
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents?.filter((a) => a.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Provisioning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents?.filter((a) => a.status === 'provisioning').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents?.reduce((sum, a) => sum + a.current_period_messages, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents?.map((agent) => (
              <Link key={agent.agent_id} to={`/agents/${agent.agent_id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{agent.agent_emoji}</span>
                        <div>
                          <h3 className="font-semibold">{agent.agent_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {agent.agent_role || agent.channel_type}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(agent.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Channel</span>
                        <span className="font-medium capitalize">{agent.channel_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Messages</span>
                        <span className="font-medium">{agent.current_period_messages}</span>
                      </div>
                      {agent.last_message_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Active</span>
                          <span className="font-medium">{formatDate(agent.last_message_at)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
