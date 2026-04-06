import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Mail, Book, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function Support() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // TODO: Implement support ticket API
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success('Support request submitted! We\'ll get back to you soon.')
    setSubject('')
    setMessage('')
    setSubmitting(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Get help with your AI agents and account
        </p>
      </div>

      {/* Quick help cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <Book className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Learn how to set up and customize your agents
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Docs
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <MessageCircle className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Live Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Chat with our support team in real-time
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <Mail className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Email Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Send us an email for detailed questions
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="mailto:support@ariel.ai">
                Contact Us
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">How do I configure my agent's personality?</h3>
            <p className="text-sm text-muted-foreground">
              Go to My Agents, click on an agent, and use the Configure button to adjust personality traits, communication style, and role context.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How do I pause my agent?</h3>
            <p className="text-sm text-muted-foreground">
              On the My Agents page, click the pause button on any agent card. Your agent will stop responding to messages until you resume it.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How is usage calculated?</h3>
            <p className="text-sm text-muted-foreground">
              Usage is based on the number of messages sent and received by your agents each month. Check the Usage & Billing page for detailed breakdowns.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I integrate with my CRM?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! Visit the Integrations page to connect with popular CRMs, calendars, and other business tools.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Send us a message and we'll help you out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide details about your question or issue..."
                rows={6}
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
