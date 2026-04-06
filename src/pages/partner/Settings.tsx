import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { partnerAPI, PartnerProfile } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function PartnerSettings() {
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await partnerAPI.getProfile()
      setProfile(data)
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || '',
        company_name: data.company_name || '',
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await partnerAPI.updateProfile(formData)
      toast.success('Profile updated successfully')
      await refreshUser()
      loadProfile()
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Partner Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your partner account settings
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Update your personal and business information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="Your company"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Partner Info */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Information</CardTitle>
          <CardDescription>
            Your partner account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referral Code:</span>
              <span className="font-medium font-mono">{profile?.referral_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commission Rate:</span>
              <span className="font-medium">{((profile?.commission_rate || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium capitalize">{profile?.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since:</span>
              <span className="font-medium">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
