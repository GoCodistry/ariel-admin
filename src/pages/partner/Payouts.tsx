import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { partnerAPI, Payout, CommissionStats } from '@/lib/api'
import { toast } from 'sonner'

export default function Payouts() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [payoutsData, statsData] = await Promise.all([
        partnerAPI.getPayouts(),
        partnerAPI.getCommissionStats(),
      ])
      setPayouts(payoutsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load payouts:', error)
      toast.error('Failed to load payouts')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    setRequesting(true)
    try {
      const result = await partnerAPI.requestPayout()
      toast.success(result.message)
      loadData() // Reload data
    } catch (error: any) {
      console.error('Failed to request payout:', error)
      toast.error(error.message || 'Failed to request payout')
    } finally {
      setRequesting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500'
      case 'processing':
        return 'bg-blue-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading payouts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payouts</h1>
        <p className="text-muted-foreground mt-2">
          Request payouts and view payment history
        </p>
      </div>

      {/* Pending earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Available for Payout</CardTitle>
          <CardDescription>
            Your current pending commission earnings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-green-600">
                ${stats?.pending_earnings.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Minimum payout: $100.00
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleRequestPayout}
              disabled={requesting || (stats?.pending_earnings || 0) < 100}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {requesting ? 'Processing...' : 'Request Payout'}
            </Button>
          </div>

          {(stats?.pending_earnings || 0) < 100 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Minimum payout not reached
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  You need ${(100 - (stats?.pending_earnings || 0)).toFixed(2)} more in pending earnings to request a payout.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earnings summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              All-Time Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats?.total_earnings.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout history */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            Your past payout requests and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payouts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div
                  key={payout.payout_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      ${payout.net_amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      Method: {payout.method}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(payout.status)} text-white`}
                    >
                      {payout.status}
                    </Badge>
                    {payout.paid_at && (
                      <p className="text-xs text-muted-foreground">
                        Paid: {new Date(payout.paid_at).toLocaleDateString()}
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
