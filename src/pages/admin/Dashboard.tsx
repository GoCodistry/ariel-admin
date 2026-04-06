import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { clientsAPI, agentsAPI, partnersAPI, analyticsAPI } from '@/lib/api'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Users, Bot, Handshake, DollarSign, TrendingUp, Activity } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

export default function Dashboard() {
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsAPI.list,
  })

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsAPI.list,
  })

  const { data: partners } = useQuery({
    queryKey: ['partners'],
    queryFn: partnersAPI.list,
  })

  const { data: revenue } = useQuery({
    queryKey: ['revenue'],
    queryFn: analyticsAPI.getRevenue,
  })

  const activeClients = clients?.filter((c) => c.status === 'active').length || 0
  const trialClients = clients?.filter((c) => c.status === 'trial').length || 0
  const activeAgents = agents?.filter((a) => a.status === 'active').length || 0

  // Mock data for charts - would come from analytics API in production
  const revenueData = [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 18700 },
    { month: 'Mar', revenue: 23400 },
    { month: 'Apr', revenue: 29800 },
    { month: 'May', revenue: 35200 },
    { month: 'Jun', revenue: 41600 },
  ]

  const clientGrowthData = [
    { month: 'Jan', clients: 8 },
    { month: 'Feb', clients: 14 },
    { month: 'Mar', clients: 21 },
    { month: 'Apr', clients: 28 },
    { month: 'May', clients: 36 },
    { month: 'Jun', clients: 45 },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeClients} active, {trialClients} on trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              {agents?.length || 0} total agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenue?.mrr || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(revenue?.average_revenue_per_client || 0)} per client
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {partners?.filter((p) => p.status === 'active').length || 0} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={clientGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients?.slice(0, 5).map((client) => (
              <div
                key={client.client_id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">
                    {client.first_name} {client.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{client.plan_tier}</p>
                  <p className="text-sm text-muted-foreground">{client.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
