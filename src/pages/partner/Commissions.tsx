import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { partnerAPI, Commission, CommissionStats } from '@/lib/api'
import { toast } from 'sonner'
import { DollarSign, TrendingUp, Calendar, User } from 'lucide-react'
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

export default function Commissions() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    try {
      const [commissionsData, statsData] = await Promise.all([
        partnerAPI.getCommissions(period === 'all' ? undefined : period),
        partnerAPI.getCommissionStats(),
      ])
      setCommissions(commissionsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load commissions:', error)
      toast.error('Failed to load commissions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'processing':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Mock chart data - would come from analytics API
  const monthlyData = [
    { month: 'Jan', earnings: 450 },
    { month: 'Feb', earnings: 680 },
    { month: 'Mar', earnings: 920 },
    { month: 'Apr', earnings: 1150 },
    { month: 'May', earnings: 1340 },
    { month: 'Jun', earnings: 1580 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading commissions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commission Breakdown</h1>
        <p className="text-muted-foreground mt-2">
          Track your commission earnings by referral
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats?.total_earnings.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              ${stats?.pending_earnings.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${stats?.paid_earnings.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats?.this_month_earnings.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Trend</CardTitle>
          <CardDescription>
            Your commission earnings over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Commission Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commission Details</CardTitle>
              <CardDescription>
                Earnings from each referral
              </CardDescription>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No commissions yet</p>
              <p className="text-sm mt-2">
                Start referring clients to earn commissions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {commissions.map((commission) => (
                <div
                  key={commission.commission_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold">{commission.client_name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(commission.period_start).toLocaleDateString()} - {new Date(commission.period_end).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Revenue: ${commission.revenue_amount.toFixed(2)}</span>
                      <span>Rate: {(commission.commission_rate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-xl font-bold text-green-600">
                      ${commission.commission_amount.toFixed(2)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(commission.status)} text-white`}
                    >
                      {commission.status}
                    </Badge>
                    {commission.paid_at && (
                      <p className="text-xs text-muted-foreground">
                        Paid: {new Date(commission.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
