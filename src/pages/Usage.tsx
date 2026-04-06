import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsAPI, agentsAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Download, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function Usage() {
  const [period, setPeriod] = useState('2026-04')

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsAPI.list,
  })

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsAPI.list,
  })

  // Calculate usage stats
  const totalMessages = clients?.reduce(
    (sum, c) => sum + c.current_period_messages,
    0
  ) || 0

  const totalLimit = clients?.reduce(
    (sum, c) => sum + c.message_limit,
    0
  ) || 0

  const utilizationRate = totalLimit > 0 ? (totalMessages / totalLimit) * 100 : 0

  // Mock data for charts
  const usageByClient = clients?.slice(0, 10).map((c) => ({
    name: `${c.first_name} ${c.last_name}`,
    messages: c.current_period_messages,
    limit: c.message_limit,
  })) || []

  const usageByChannel = [
    { name: 'SMS', value: 3245, fill: 'hsl(var(--primary))' },
    { name: 'WhatsApp', value: 1823, fill: 'hsl(262, 83%, 68%)' },
    { name: 'Telegram', value: 456, fill: 'hsl(262, 83%, 78%)' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Message Usage</h1>
          <p className="text-muted-foreground">
            Track message usage across clients and agents
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalLimit.toLocaleString()} total limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {(totalLimit - totalMessages).toLocaleString()} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents?.filter((a) => a.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {agents?.length || 0} total agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overage Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageByClient}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageByChannel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {usageByChannel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Client Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Usage Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Messages Used</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Overage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.map((client) => {
                const utilization = (client.current_period_messages / client.message_limit) * 100
                const overage = Math.max(0, client.current_period_messages - client.message_limit)

                return (
                  <TableRow key={client.client_id}>
                    <TableCell className="font-medium">
                      {client.first_name} {client.last_name}
                    </TableCell>
                    <TableCell className="capitalize">
                      {client.plan_tier.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{client.current_period_messages.toLocaleString()}</TableCell>
                    <TableCell>{client.message_limit.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(100, utilization)}%` }}
                          />
                        </div>
                        <span className="text-sm">{utilization.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {overage > 0 ? (
                        <span className="text-destructive font-medium">
                          +{overage.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'active' ? 'success' : 'warning'}>
                        {client.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
