import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { ToastContainer } from '../ui/Toast'

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/3 rounded-full blur-[100px]" />
      </div>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
          <Zap size={20} className="text-text-inverse" />
        </div>
        <span className="font-heading text-2xl font-bold text-gold">FlowZap</span>
      </Link>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>

      <ToastContainer />
    </div>
  )
}
