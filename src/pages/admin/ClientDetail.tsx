import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { clientsAPI, agentsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Phone, Building2, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>()

  const { data: client, isLoading } = useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => clientsAPI.get(clientId!),
    enabled: !!clientId,
  })

  const { data: agents } = useQuery({
    queryKey: ['agents', 'client', clientId],
    queryFn: () => agentsAPI.listByClient(clientId!),
    enabled: !!clientId,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!client) {
    return <div>Client not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {client.first_name} {client.last_name}
            </h1>
            <p className="text-muted-foreground">{client.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          <Button variant="destructive">Deactivate</Button>
        </div>
      </div>

      {/* Client Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {client.email}
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {client.phone}
              </div>
            )}
            {client.company_name && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {client.company_name}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="text-sm font-medium capitalize">
                {client.plan_tier.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">MRR</span>
              <span className="text-sm font-medium">
                {formatCurrency(client.monthly_price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={client.status === 'active' ? 'success' : 'warning'}>
                {client.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Messages Used</span>
              <span className="text-sm font-medium">
                {client.current_period_messages} / {client.message_limit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Agents</span>
              <span className="text-sm font-medium">{agents?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm font-medium">{formatDate(client.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agents</CardTitle>
            <Button size="sm">Add Agent</Button>
          </div>
        </CardHeader>
        <CardContent>
          {agents && agents.length > 0 ? (
            <div className="space-y-4">
              {agents.map((agent) => (
                <Link
                  key={agent.agent_id}
                  to={`/agents/${agent.agent_id}`}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-accent/50 p-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{agent.agent_emoji}</span>
                    <div>
                      <p className="font-medium">{agent.agent_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.agent_role || agent.channel_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={agent.status === 'active' ? 'success' : 'secondary'}>
                      {agent.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {agent.current_period_messages} messages
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No agents configured yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
