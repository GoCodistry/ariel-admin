import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CreditCard,
  Package,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Overview', href: '/partners/dashboard', icon: LayoutDashboard },
  { name: 'My Referrals', href: '/partners/dashboard/referrals', icon: Users },
  { name: 'Commissions', href: '/partners/dashboard/commissions', icon: DollarSign },
  { name: 'Payouts', href: '/partners/dashboard/payouts', icon: CreditCard },
  { name: 'Resources', href: '/partners/dashboard/resources', icon: Package },
  { name: 'Settings', href: '/partners/dashboard/settings', icon: Settings },
]

export default function PartnerLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Ariel Partners
          </h1>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/partners/dashboard' && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User info and logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-16 items-center justify-between px-8">
            <h2 className="text-lg font-semibold">
              {navigation.find((item) =>
                location.pathname === item.href ||
                (item.href !== '/partners/dashboard' && location.pathname.startsWith(item.href))
              )?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Partner Dashboard
              </span>
            </div>
          </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
