import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { clientAPI, ClientAgent } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AgentConfig() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<ClientAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    communication_style: 'professional',
    tone: 50,
    verbosity: 50,
    creativity: 50,
    role_context: '',
    hard_limits: [] as string[],
  })

  useEffect(() => {
    loadAgent()
  }, [agentId])

  const loadAgent = async () => {
    if (!agentId) return

    try {
      const data = await clientAPI.getAgent(agentId)
      setAgent(data)

      // Load existing personality traits
      setFormData({
        communication_style: data.communication_style || 'professional',
        tone: data.personality_traits?.tone || 50,
        verbosity: data.personality_traits?.verbosity || 50,
        creativity: data.personality_traits?.creativity || 50,
        role_context: data.personality_traits?.role_context || '',
        hard_limits: data.personality_traits?.hard_limits || [],
      })
    } catch (error) {
      console.error('Failed to load agent:', error)
      toast.error('Failed to load agent')
      navigate('/dashboard/agents')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!agentId) return

    setSaving(true)
    try {
      await clientAPI.updateAgentPersonality(agentId, {
        communication_style: formData.communication_style,
        personality_traits: {
          tone: formData.tone,
          verbosity: formData.verbosity,
          creativity: formData.creativity,
          role_context: formData.role_context,
        },
        hard_limits: formData.hard_limits,
      })
      toast.success('Agent personality updated successfully')
      loadAgent()
    } catch (error) {
      console.error('Failed to update agent:', error)
      toast.error('Failed to update agent')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading agent configuration...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Agent not found</p>
          <Button onClick={() => navigate('/dashboard/agents')}>
            Back to Agents
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/agents')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Configure Agent</h1>
          <p className="text-muted-foreground mt-1">
            {agent.agent_emoji} {agent.agent_name}
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {agent.status}
        </Badge>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>
            Basic details about your agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Agent Name</Label>
              <Input value={agent.agent_name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Agent Role</Label>
              <Input value={agent.agent_role || 'Not set'} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Channel Type</Label>
            <Input value={agent.channel_type} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Communication Style */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Style</CardTitle>
          <CardDescription>
            How your agent communicates with customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Style Preset</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['professional', 'casual', 'friendly', 'formal'].map((style) => (
                <Button
                  key={style}
                  variant={formData.communication_style === style ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, communication_style: style })}
                  className="capitalize"
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Tone</Label>
                <span className="text-sm text-muted-foreground">
                  {formData.tone < 33 ? 'Serious' : formData.tone < 66 ? 'Balanced' : 'Lighthearted'}
                </span>
              </div>
              <Slider
                value={[formData.tone]}
                onValueChange={([value]) => setFormData({ ...formData, tone: value })}
                min={0}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Control how serious or lighthearted your agent sounds
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Verbosity</Label>
                <span className="text-sm text-muted-foreground">
                  {formData.verbosity < 33 ? 'Concise' : formData.verbosity < 66 ? 'Moderate' : 'Detailed'}
                </span>
              </div>
              <Slider
                value={[formData.verbosity]}
                onValueChange={([value]) => setFormData({ ...formData, verbosity: value })}
                min={0}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                How much detail your agent provides in responses
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Creativity</Label>
                <span className="text-sm text-muted-foreground">
                  {formData.creativity < 33 ? 'Factual' : formData.creativity < 66 ? 'Balanced' : 'Creative'}
                </span>
              </div>
              <Slider
                value={[formData.creativity]}
                onValueChange={([value]) => setFormData({ ...formData, creativity: value })}
                min={0}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                How creative vs factual your agent is in responses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Context */}
      <Card>
        <CardHeader>
          <CardTitle>Role & Context</CardTitle>
          <CardDescription>
            Provide specific instructions for your agent's role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="role_context">Role Instructions</Label>
            <Textarea
              id="role_context"
              placeholder="Example: You are a customer service representative for a tech company. Always be helpful and patient. Focus on solving customer issues quickly."
              value={formData.role_context}
              onChange={(e) => setFormData({ ...formData, role_context: e.target.value })}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Describe what role your agent should play and any specific instructions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/dashboard/agents')}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
