import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Users, TrendingUp, ExternalLink } from 'lucide-react'
import { partnerAPI, CommissionStats } from '@/lib/api'

export default function PartnerHome() {
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await partnerAPI.getCommissionStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Earnings',
      value: `$${stats?.total_earnings.toLocaleString() || '0'}`,
      icon: DollarSign,
      description: 'All-time commission earnings',
      color: 'text-green-600',
    },
    {
      title: 'Pending Earnings',
      value: `$${stats?.pending_earnings.toLocaleString() || '0'}`,
      icon: TrendingUp,
      description: 'Awaiting payout',
      color: 'text-yellow-600',
    },
    {
      title: 'Active Referrals',
      value: stats?.active_referrals || 0,
      icon: Users,
      description: `of ${stats?.total_referrals || 0} total`,
      color: 'text-blue-600',
    },
    {
      title: 'This Month',
      value: `$${stats?.this_month_earnings.toLocaleString() || '0'}`,
      icon: DollarSign,
      description: 'Current period earnings',
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div>
        <h1 className="text-3xl font-bold">Partner Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your referrals and commission earnings
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid gap-4 md:grid-cols-2">
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link to="/partners/dashboard/referrals">
                <Users className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">View Referrals</div>
                  <div className="text-xs text-muted-foreground">
                    See all your referred clients
                  </div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link to="/partners/dashboard/commissions">
                <DollarSign className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">View Commissions</div>
                  <div className="text-xs text-muted-foreground">
                    Track your earnings history
                  </div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link to="/partners/dashboard/payouts">
                <TrendingUp className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Request Payout</div>
                  <div className="text-xs text-muted-foreground">
                    Withdraw your earnings
                  </div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link to="/partners/dashboard/resources">
                <ExternalLink className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Marketing Resources</div>
                  <div className="text-xs text-muted-foreground">
                    Download promotional materials
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Commission charts coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
