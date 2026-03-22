import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Workflow,
  Users,
  MessageSquare,
  Smartphone,
  Webhook,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useInstanceStore } from '../../stores/instanceStore'
import { getInitials } from '../../lib/utils'
import { Tooltip } from '../ui/Tooltip'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/flows', icon: <Workflow size={18} />, label: 'Fluxos' },
  { to: '/contacts', icon: <Users size={18} />, label: 'Contatos' },
  { to: '/conversations', icon: <MessageSquare size={18} />, label: 'Conversas' },
  { to: '/instances', icon: <Smartphone size={18} />, label: 'Instâncias' },
  { to: '/webhooks', icon: <Webhook size={18} />, label: 'Webhooks' },
  { to: '/settings', icon: <Settings size={18} />, label: 'Configurações' },
]

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const { instances } = useInstanceStore()
  const location = useLocation()

  const connectedCount = instances.filter((i) => i.status === 'connected').length

  return (
    <aside
      className={`
        relative flex flex-col
        bg-background-card border-r border-border
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
        min-h-screen flex-shrink-0
      `}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
            <Zap size={16} className="text-text-inverse" />
          </div>
          {!collapsed && (
            <span className="font-heading text-xl font-bold text-gold whitespace-nowrap">
              FlowZap
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)

          const linkContent = (
            <NavLink
              key={item.to}
              to={item.to}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                font-body text-sm font-medium
                transition-all duration-150 group relative
                ${collapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? 'bg-gold-muted text-gold border border-border'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated'
                }
              `}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-gold' : ''}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-gold text-text-inverse text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gold rounded-r-full" />
              )}
            </NavLink>
          )

          return collapsed ? (
            <Tooltip key={item.to} content={item.label} position="right">
              {linkContent}
            </Tooltip>
          ) : (
            <React.Fragment key={item.to}>{linkContent}</React.Fragment>
          )
        })}
      </nav>

      {/* Instance status */}
      {!collapsed && instances.length > 0 && (
        <div className="mx-2 mb-2 p-3 bg-background-elevated rounded-xl border border-border-subtle">
          <p className="text-xs text-text-muted font-body mb-1.5">WhatsApp</p>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                connectedCount > 0 ? 'bg-success animate-pulse' : 'bg-text-muted'
              }`}
            />
            <span className="text-xs text-text-secondary font-body">
              {connectedCount} de {instances.length} conectada(s)
            </span>
          </div>
        </div>
      )}

      {/* User */}
      <div className="border-t border-border p-2">
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-background-elevated cursor-pointer group ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-text-inverse flex-shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary font-body truncate">{user?.name}</p>
                <p className="text-xs text-text-muted font-body truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-danger p-1"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-background-elevated border border-border rounded-full flex items-center justify-center text-text-muted hover:text-gold hover:border-gold transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
