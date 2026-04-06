import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, MessageSquare, TrendingUp, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { clientAPI } from '@/lib/api'

interface Stats {
  agentsCount: number
  messagesThisMonth: number
  activeAgents: number
}

export default function ClientHome() {
  const [stats, setStats] = useState<Stats>({
    agentsCount: 0,
    messagesThisMonth: 0,
    activeAgents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const agents = await clientAPI.getAgents()
      setStats({
        agentsCount: agents.length,
        messagesThisMonth: 0, // TODO: Implement usage tracking
        activeAgents: agents.filter((a: any) => a.status === 'active').length,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Total Agents',
      value: stats.agentsCount,
      icon: Bot,
      description: `${stats.activeAgents} active`,
      color: 'text-blue-600',
    },
    {
      title: 'Messages This Month',
      value: stats.messagesThisMonth,
      icon: MessageSquare,
      description: 'Across all agents',
      color: 'text-green-600',
    },
    {
      title: 'Performance',
      value: '—',
      icon: TrendingUp,
      description: 'Coming soon',
      color: 'text-purple-600',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your AI agents and activity.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.agentsCount === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
              <p className="text-muted-foreground mb-4">
                Contact your account manager to set up your first AI agent.
              </p>
              <Button asChild>
                <Link to="/dashboard/support">
                  <Plus className="h-4 w-4 mr-2" />
                  Get Help
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link to="/dashboard/agents">
                  <Bot className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Agents</div>
                    <div className="text-xs text-muted-foreground">
                      View and configure your agents
                    </div>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link to="/dashboard/usage">
                  <TrendingUp className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">View Usage</div>
                    <div className="text-xs text-muted-foreground">
                      Check message usage and billing
                    </div>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link to="/dashboard/integrations">
                  <Plus className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Add Integrations</div>
                    <div className="text-xs text-muted-foreground">
                      Connect CRM, calendar, and more
                    </div>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link to="/dashboard/settings">
                  <MessageSquare className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Account Settings</div>
                    <div className="text-xs text-muted-foreground">
                      Update profile and preferences
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent activity - placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to display</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
