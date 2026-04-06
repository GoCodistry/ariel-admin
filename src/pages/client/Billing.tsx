import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { clientAPI } from '@/lib/api'
import { toast } from 'sonner'
import { CreditCard, Download, DollarSign, Calendar, CheckCircle } from 'lucide-react'

interface BillingInfo {
  plan_tier: string
  monthly_price: number
  message_limit: number
  current_period_messages: number
  next_billing_date?: string
  payment_method?: {
    type: string
    last4: string
    exp_month: number
    exp_year: number
  }
}

interface Invoice {
  invoice_id: string
  amount: number
  status: string
  created_at: string
  paid_at?: string
  period_start: string
  period_end: string
}

export default function Billing() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingPayment, setUpdatingPayment] = useState(false)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const profile = await clientAPI.getProfile()
      // Mock billing info - would come from actual billing API
      setBillingInfo({
        plan_tier: profile.plan_tier,
        monthly_price: 99,
        message_limit: 10000,
        current_period_messages: 3542,
        next_billing_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: {
          type: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2026,
        },
      })

      // Mock invoices
      setInvoices([
        {
          invoice_id: 'inv_001',
          amount: 99,
          status: 'paid',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          period_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          invoice_id: 'inv_002',
          amount: 99,
          status: 'paid',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          paid_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          period_start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
    } catch (error) {
      console.error('Failed to load billing data:', error)
      toast.error('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePayment = async () => {
    setUpdatingPayment(true)
    try {
      // This would integrate with Stripe
      toast.info('Payment method update coming soon')
    } catch (error) {
      console.error('Failed to update payment method:', error)
      toast.error('Failed to update payment method')
    } finally {
      setUpdatingPayment(false)
    }
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      toast.info('Invoice download coming soon')
    } catch (error) {
      console.error('Failed to download invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading billing information...</div>
      </div>
    )
  }

  const usagePercentage = billingInfo
    ? (billingInfo.current_period_messages / billingInfo.message_limit) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your active subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold capitalize">{billingInfo?.plan_tier} Plan</p>
              <p className="text-muted-foreground">
                ${billingInfo?.monthly_price}/month
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Message Usage</span>
              <span className="font-medium">
                {billingInfo?.current_period_messages.toLocaleString()} / {billingInfo?.message_limit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {usagePercentage.toFixed(1)}% of monthly limit used
            </p>
          </div>

          {billingInfo?.next_billing_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Next billing date: {new Date(billingInfo.next_billing_date).toLocaleDateString()}
            </div>
          )}

          <Button variant="outline" className="w-full">
            Change Plan
          </Button>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {billingInfo?.payment_method ? (
            <>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {billingInfo.payment_method.type} ending in {billingInfo.payment_method.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {billingInfo.payment_method.exp_month}/{billingInfo.payment_method.exp_year}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleUpdatePayment}
                disabled={updatingPayment}
              >
                Update Payment Method
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No payment method on file</p>
              <Button onClick={handleUpdatePayment} disabled={updatingPayment}>
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your past invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoice_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invoiced on {new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={
                        invoice.status === 'paid'
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }
                    >
                      {invoice.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.invoice_id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
