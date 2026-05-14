import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Image, Settings, Users,
  Building2, Zap, ChevronRight,
} from 'lucide-react'
import { useAuth }           from '@/contexts/AuthContext'
import { ClientSelector }    from './ClientSelector'
import { cn }                from '@/lib/utils'

const clientNav = [
  { label: 'Dashboard', href: '/dashboard',          icon: LayoutDashboard, end: true },
  { label: 'Pages',     href: '/dashboard/pages',    icon: FileText },
  { label: 'Media',     href: '/dashboard/media',    icon: Image },
  { label: 'Users',     href: '/dashboard/users',    icon: Users },
  { label: 'Settings',  href: '/dashboard/settings', icon: Settings },
]

const adminNav = [
  { label: 'Clients',  href: '/admin/clients', icon: Building2 },
]

function NavItem({ href, icon: Icon, label, end }) {
  return (
    <NavLink
      to={href}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-[hsl(var(--sidebar-accent))] text-white'
            : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  )
}

export function Sidebar({ open }) {
  const { profile, isAdmin } = useAuth()

  return (
    <aside
      className={cn(
        'flex flex-col bg-[hsl(var(--sidebar-background))] transition-all duration-200 shrink-0',
        open ? 'w-60' : 'w-0 overflow-hidden'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-white">Agency CMS</span>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {/* Admin: client switcher */}
        {isAdmin && (
          <div className="mb-2">
            <ClientSelector />
          </div>
        )}

        {/* Main nav */}
        <nav className="space-y-0.5">
          {clientNav.map(item => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-[hsl(var(--sidebar-border))]" />
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Admin
            </p>
            <nav className="space-y-0.5">
              {adminNav.map(item => (
                <NavItem key={item.href} {...item} />
              ))}
            </nav>
          </>
        )}
      </div>

      {/* Profile footer */}
      {profile && (
        <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
              {(profile.full_name ?? profile.email)?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {profile.full_name ?? profile.email}
              </p>
              <p className="text-[10px] capitalize text-white/40">{profile.role}</p>
            </div>
            <ChevronRight className="h-3 w-3 text-white/30" />
          </div>
        </div>
      )}
    </aside>
  )
}
