import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Copy, Check, QrCode } from 'lucide-react'
import { partnerAPI, Referral } from '@/lib/api'
import { toast } from 'sonner'

export default function Referrals() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referralLink, setReferralLink] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [referralsData, linkData] = await Promise.all([
        partnerAPI.getReferrals(),
        partnerAPI.getReferralLink(),
      ])
      setReferrals(referralsData)
      setReferralLink(linkData.referral_link)
      setQrCodeUrl(linkData.qr_code_url)
    } catch (error) {
      console.error('Failed to load referrals:', error)
      toast.error('Failed to load referrals')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'trial':
        return 'bg-blue-500'
      case 'paused':
        return 'bg-yellow-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading referrals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Referrals</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your referred clients
        </p>
      </div>

      {/* Referral link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link to earn commissions on new signups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyToClipboard} variant="outline">
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {qrCodeUrl && (
            <div className="flex items-center gap-4 pt-4 border-t">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-32 h-32 border rounded"
              />
              <div>
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Code
                </h4>
                <p className="text-sm text-muted-foreground">
                  Download or share this QR code for easy access to your referral link
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referrals list */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>
            {referrals.length} total referral{referrals.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No referrals yet</p>
              <p className="text-sm">Share your referral link to start earning commissions!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.referral_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{referral.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {referral.client_email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Signed up: {referral.signup_date ? new Date(referral.signup_date).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(referral.client_status)} text-white`}
                    >
                      {referral.client_status}
                    </Badge>
                    {referral.current_plan && (
                      <p className="text-sm text-muted-foreground capitalize">
                        {referral.current_plan} plan
                      </p>
                    )}
                    <p className="text-sm font-semibold">
                      ${referral.current_mrr}/mo
                    </p>
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
