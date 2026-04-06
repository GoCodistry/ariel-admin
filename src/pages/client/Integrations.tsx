import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Database, Mail, MessageSquare, Slack, Zap } from 'lucide-react'

const integrations = [
  {
    name: 'Slack',
    description: 'Connect your agents to Slack channels for team communication',
    icon: Slack,
    category: 'Messaging',
    status: 'coming_soon',
  },
  {
    name: 'Google Calendar',
    description: 'Sync appointments and schedule meetings automatically',
    icon: Calendar,
    category: 'Productivity',
    status: 'coming_soon',
  },
  {
    name: 'Gmail',
    description: 'Send and receive emails through your agents',
    icon: Mail,
    category: 'Email',
    status: 'coming_soon',
  },
  {
    name: 'HubSpot',
    description: 'Sync contacts and deals with your CRM',
    icon: Database,
    category: 'CRM',
    status: 'coming_soon',
  },
  {
    name: 'Zapier',
    description: 'Connect to 5,000+ apps with Zapier automation',
    icon: Zap,
    category: 'Automation',
    status: 'coming_soon',
  },
  {
    name: 'WhatsApp Business',
    description: 'Deploy agents on WhatsApp for customer support',
    icon: MessageSquare,
    category: 'Messaging',
    status: 'coming_soon',
  },
]

export default function Integrations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your agents with the tools you already use
        </p>
      </div>

      {/* Coming soon banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Integrations Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                We're working hard to bring you seamless integrations with your favorite tools.
                These integrations will allow your agents to access calendars, send emails, sync with your CRM, and more.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Want to request a specific integration? Contact our support team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <Card key={integration.name} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {integration.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {integration.description}
                </CardDescription>
                <Button
                  disabled
                  variant="outline"
                  className="w-full"
                >
                  Coming Soon
                </Button>
              </CardContent>

              {/* Overlay to indicate disabled state */}
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] pointer-events-none" />
            </Card>
          )
        })}
      </div>

      {/* Custom integration info */}
      <Card>
        <CardHeader>
          <CardTitle>Need a Custom Integration?</CardTitle>
          <CardDescription>
            Contact our team to discuss custom integrations for your specific needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Contact Sales</Button>
        </CardContent>
      </Card>
    </div>
  )
}
