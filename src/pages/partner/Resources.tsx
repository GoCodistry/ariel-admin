import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Image, Video, Download } from 'lucide-react'

const resources = [
  {
    id: '1',
    title: 'Ariel Overview Presentation',
    description: 'Comprehensive slide deck introducing Ariel\'s features and benefits',
    type: 'presentation',
    icon: FileText,
  },
  {
    id: '2',
    title: 'Partner Logo Pack',
    description: 'High-resolution logos and brand assets for marketing materials',
    type: 'images',
    icon: Image,
  },
  {
    id: '3',
    title: 'Demo Video',
    description: 'Product walkthrough video for client presentations',
    type: 'video',
    icon: Video,
  },
  {
    id: '4',
    title: 'Email Templates',
    description: 'Ready-to-use email templates for outreach campaigns',
    type: 'template',
    icon: FileText,
  },
  {
    id: '5',
    title: 'Social Media Graphics',
    description: 'Pre-designed graphics for social media promotion',
    type: 'images',
    icon: Image,
  },
  {
    id: '6',
    title: 'Partner Onboarding Guide',
    description: 'Complete guide to getting started as an Ariel partner',
    type: 'document',
    icon: FileText,
  },
]

export default function Resources() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Resources</h1>
        <p className="text-muted-foreground mt-2">
          Download promotional materials to help you succeed
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => {
          const Icon = resource.icon
          return (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {resource.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need Custom Materials?</CardTitle>
          <CardDescription>
            Contact our partner success team for custom marketing materials tailored to your audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Contact Partner Success</Button>
        </CardContent>
      </Card>
    </div>
  )
}
