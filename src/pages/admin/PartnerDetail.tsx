import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { partnersAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Mail, Building2, Calendar, DollarSign } from 'lucide-react'
import { formatDate, formatCurrency, formatPercent } from '@/lib/utils'

export default function PartnerDetail() {
  const { partnerId } = useParams<{ partnerId: string }>()

  const { data: partner, isLoading } = useQuery({
    queryKey: ['partners', partnerId],
    queryFn: () => partnersAPI.get(partnerId!),
    enabled: !!partnerId,
  })

  // Mock data for referrals and commissions
  const referrals = [
    {
      id: '1',
      client_name: 'John Doe',
      client_email: 'john@example.com',
      signup_date: '2026-03-15',
      plan: 'starter_team',
      mrr: 497,
      status: 'active',
    },
    {
      id: '2',
      client_name: 'Jane Smith',
      client_email: 'jane@example.com',
      signup_date: '2026-03-20',
      plan: 'solo',
      mrr: 97,
      status: 'active',
    },
  ]

  const commissions = [
    {
      id: '1',
      period: '2026-04',
      client_name: 'John Doe',
      amount: 99.4,
      status: 'pending',
    },
    {
      id: '2',
      period: '2026-04',
      client_name: 'Jane Smith',
      amount: 19.4,
      status: 'pending',
    },
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!partner) {
    return <div>Partner not found</div>
  }

  const totalCommissionsPending = commissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/partners">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {partner.first_name} {partner.last_name}
            </h1>
            <p className="text-muted-foreground">{partner.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          {partner.status === 'applied' && (
            <Button>Approve Partner</Button>
          )}
        </div>
      </div>

      {/* Partner Info */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xl font-mono font-bold">
              {partner.referral_code}
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(partner.commission_rate)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs text-muted-foreground">
              {referrals.filter((r) => r.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCommissionsPending)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Details */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {partner.email}
            </div>
            {partner.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {partner.phone}
              </div>
            )}
            {partner.company_name && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {partner.company_name}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={
                  partner.status === 'active'
                    ? 'success'
                    : partner.status === 'applied'
                    ? 'warning'
                    : 'secondary'
                }
              >
                {partner.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(partner.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Signup Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.client_name}</TableCell>
                  <TableCell>{referral.client_email}</TableCell>
                  <TableCell className="capitalize">
                    {referral.plan.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{formatCurrency(referral.mrr)}</TableCell>
                  <TableCell>{formatDate(referral.signup_date)}</TableCell>
                  <TableCell>
                    <Badge variant="success">{referral.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Commissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Commissions</CardTitle>
            <Button size="sm" variant="outline">
              Create Payout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">{commission.period}</TableCell>
                  <TableCell>{commission.client_name}</TableCell>
                  <TableCell>{formatCurrency(commission.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="warning">{commission.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
