import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bot, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { clientAPI, type AgentTemplate, type IndustryBundle } from '@/lib/api'
import { toast } from 'sonner'

export default function NewAgent() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<AgentTemplate[]>([])
  const [bundles, setBundles] = useState<IndustryBundle[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await clientAPI.getAgentTemplates()
      setTemplates(data.templates)
      setBundles(data.bundles)
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load agent templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = async (templateId: string, templateName: string) => {
    setCreating(templateId)
    try {
      const agent = await clientAPI.createAgent({
        template_id: templateId,
        channel_type: 'email', // Default to email
      })
      toast.success(`${templateName} has been created!`)
      navigate(`/dashboard/agents/${agent.agent_id}/config`)
    } catch (error) {
      console.error('Failed to create agent:', error)
      toast.error('Failed to create agent')
    } finally {
      setCreating(null)
    }
  }

  const handleCreateBundle = async (bundleId: string, bundleName: string) => {
    setCreating(bundleId)
    try {
      const result = await clientAPI.createAgentBundle({
        bundle_id: bundleId,
        channel_type: 'email', // Default to email
      })
      toast.success(`${bundleName} bundle created! ${result.agents.length} agents ready.`)
      navigate('/dashboard/agents')
    } catch (error) {
      console.error('Failed to create bundle:', error)
      toast.error('Failed to create agent bundle')
    } finally {
      setCreating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/agents')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Agent</h1>
          <p className="text-muted-foreground mt-2">
            Choose a pre-configured template or an industry bundle
          </p>
        </div>
      </div>

      {/* Industry Bundles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Industry Bundles</h2>
        </div>
        <p className="text-muted-foreground">
          Complete team setups for your industry
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {bundles.map((bundle) => {
            const bundleTemplates = templates.filter((t) =>
              bundle.agent_templates.includes(t.id)
            )

            return (
              <Card key={bundle.id} className="relative hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{bundle.emoji}</div>
                      <div>
                        <CardTitle className="text-xl">{bundle.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {bundle.agent_templates.length} agents
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2 font-medium text-base">
                    {bundle.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{bundle.description}</p>

                  <div>
                    <p className="text-sm font-medium mb-2">Included agents:</p>
                    <div className="flex flex-wrap gap-2">
                      {bundleTemplates.map((template) => (
                        <Badge key={template.id} variant="outline" className="text-xs">
                          {template.emoji} {template.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleCreateBundle(bundle.id, bundle.name)}
                    disabled={creating === bundle.id}
                  >
                    {creating === bundle.id ? 'Creating...' : 'Create Bundle'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Individual Agent Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Individual Agents</h2>
        </div>
        <p className="text-muted-foreground">
          Create a single specialized agent
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{template.emoji}</div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {template.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2 font-medium">
                  {template.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{template.description}</p>

                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Style:</span> {template.communication_style}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleCreateAgent(template.id, template.name)}
                  disabled={creating === template.id}
                >
                  {creating === template.id ? 'Creating...' : 'Create Agent'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
