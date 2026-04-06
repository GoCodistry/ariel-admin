import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { partnersAPI, Partner } from '@/lib/api'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { formatDate, formatPercent, formatCurrency } from '@/lib/utils'

export default function Partners() {
  const [search, setSearch] = useState('')

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: partnersAPI.list,
  })

  const filteredPartners = partners?.filter(
    (partner) =>
      partner.email.toLowerCase().includes(search.toLowerCase()) ||
      partner.first_name.toLowerCase().includes(search.toLowerCase()) ||
      partner.last_name.toLowerCase().includes(search.toLowerCase()) ||
      partner.referral_code.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: Partner['status']) => {
    const variants: Record<
      Partner['status'],
      'default' | 'success' | 'warning' | 'destructive' | 'secondary'
    > = {
      applied: 'warning',
      approved: 'default',
      active: 'success',
      suspended: 'destructive',
      deactivated: 'secondary',
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  if (isLoading) {
    return <div>Loading partners...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partners</h1>
          <p className="text-muted-foreground">
            Manage partner accounts, referrals, and commissions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners?.filter((p) => p.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners?.filter((p) => p.status === 'applied').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search partners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners?.map((partner) => (
                <TableRow key={partner.partner_id}>
                  <TableCell className="font-medium">
                    {partner.first_name} {partner.last_name}
                  </TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>{partner.company_name || '-'}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {partner.referral_code}
                    </code>
                  </TableCell>
                  <TableCell>{formatPercent(partner.commission_rate)}</TableCell>
                  <TableCell>{getStatusBadge(partner.status)}</TableCell>
                  <TableCell>{formatDate(partner.created_at)}</TableCell>
                  <TableCell>
                    <Link to={`/partners/${partner.partner_id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
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
