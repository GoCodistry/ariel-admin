import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { clientAPI } from '@/lib/api'
import { BarChart3, TrendingUp, Calendar } from 'lucide-react'

export default function Usage() {
  const [profile, setProfile] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [profileData, agentsData] = await Promise.all([
        clientAPI.getProfile(),
        clientAPI.getAgents(),
      ])
      setProfile(profileData)
      setAgents(agentsData)
    } catch (error) {
      console.error('Failed to load usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading usage data...</div>
      </div>
    )
  }

  // Mock data - in production this would come from the API
  const currentPeriodMessages = 0
  const messageLimit = 1000
  const usagePercentage = (currentPeriodMessages / messageLimit) * 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usage & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your message usage and subscription details
        </p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription and usage details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Plan Tier</p>
              <p className="text-2xl font-bold capitalize">{profile?.plan_tier || 'Trial'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-2xl font-bold capitalize">{profile?.status || 'Active'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Agents</p>
              <p className="text-2xl font-bold">{agents.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Message Usage This Month
          </CardTitle>
          <CardDescription>
            Track your message usage across all agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentPeriodMessages.toLocaleString()} messages used</span>
              <span className="text-muted-foreground">
                of {messageLimit.toLocaleString()} included
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inbound Messages</p>
                <p className="text-lg font-semibold">0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outbound Messages</p>
                <p className="text-lg font-semibold">0</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-agent usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Agent</CardTitle>
          <CardDescription>
            Message breakdown for each of your agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No agents yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.agent_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{agent.agent_emoji}</div>
                    <div>
                      <p className="font-semibold">{agent.agent_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.agent_role || 'No role specified'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">0 messages</p>
                    <p className="text-sm text-muted-foreground">this month</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing period */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Period</CardTitle>
          <CardDescription>
            Your current billing cycle and renewal date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing Cycle:</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Period:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString()} - {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Renewal:</span>
              <span className="font-medium">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
