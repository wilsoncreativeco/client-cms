import { FileText, Image, Users, Globe, ArrowUpRight, Activity } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/utils'

const statsClient = [
  { label: 'Pages',        icon: FileText, value: '—', href: '/dashboard/pages',  color: 'text-blue-500'   },
  { label: 'Media files',  icon: Image,    value: '—', href: '/dashboard/media',  color: 'text-purple-500' },
  { label: 'Team members', icon: Users,    value: '—', href: '/dashboard/users',  color: 'text-emerald-500'},
]

export default function DashboardHome() {
  const { profile, client, isAdmin } = useAuth()
  const greeting = getGreeting()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin
            ? 'Here\'s an overview of your agency.'
            : `Managing ${client?.business_name ?? 'your website'}.`
          }
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsClient.map(stat => (
          <Card key={stat.label} className="group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Link
                to={stat.href}
                className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" asChild className="justify-start gap-2">
              <Link to="/dashboard/pages">
                <FileText className="h-4 w-4" /> Edit pages
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="justify-start gap-2">
              <Link to="/dashboard/media">
                <Image className="h-4 w-4" /> Upload media
              </Link>
            </Button>
            {client?.custom_domain && (
              <Button variant="outline" size="sm" asChild className="justify-start gap-2">
                <a href={`https://${client.custom_domain}`} target="_blank" rel="noreferrer">
                  <Globe className="h-4 w-4" /> View site
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity feed will appear here as you make changes.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Site status */}
      {client && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Site details</CardTitle>
              <Badge variant={client.is_active ? 'success' : 'secondary'}>
                {client.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Business',  value: client.business_name },
              { label: 'Slug',      value: client.slug },
              { label: 'Domain',    value: client.custom_domain ?? 'Not set' },
              { label: 'Plan',      value: client.plan },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-sm font-medium truncate">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
