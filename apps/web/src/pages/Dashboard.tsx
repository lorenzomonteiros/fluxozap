import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Workflow,
  Users,
  MessageSquare,
  Smartphone,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { flowsService } from '../services/flows.service'
import { instancesService } from '../services/instances.service'
import { contactsService } from '../services/contacts.service'
import { useAuthStore } from '../stores/authStore'
import { useInstanceStore } from '../stores/instanceStore'
import { useSocket } from '../hooks/useSocket'
import { formatRelativeTime } from '../lib/utils'
import { DashboardStats, WhatsAppInstance } from '../types'

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-elevated border border-border rounded-lg px-3 py-2 shadow-card">
        <p className="text-xs text-text-secondary font-body">{label}</p>
        <p className="text-sm font-medium text-gold font-body">{payload[0].value} execuções</p>
      </div>
    )
  }
  return null
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const { instances, setInstances } = useInstanceStore()
  const { joinInstance } = useSocket()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [contactCount, setContactCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<Array<{ day: string; executions: number }>>([])

  useEffect(() => {
    async function load() {
      try {
        const [statsData, contactsData, instancesData] = await Promise.all([
          flowsService.getStats(),
          contactsService.getContacts({ limit: 1 }),
          instancesService.getInstances(),
        ])

        setStats(statsData)
        setContactCount(contactsData.pagination.total)
        setInstances(instancesData)

        // Join socket rooms for all instances
        instancesData.forEach((i: WhatsAppInstance) => joinInstance(i.id))

        // Build chart data from recent executions
        const now = new Date()
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now)
          d.setDate(d.getDate() - (6 - i))
          return {
            day: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
            executions: 0,
          }
        })

        statsData.recentExecutions.forEach((exec) => {
          const execDate = new Date(exec.startedAt)
          const dayIdx = days.findIndex((d) => {
            const dDate = new Date(now)
            dDate.setDate(dDate.getDate() - (6 - days.indexOf(d)))
            return dDate.toDateString() === execDate.toDateString()
          })
          if (dayIdx !== -1) days[dayIdx].executions++
        })

        setChartData(days)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [setInstances, joinInstance])

  const connectedInstances = instances.filter((i) => i.status === 'connected').length
  const activeFlows = stats?.activeFlows ?? 0
  const totalFlows = stats?.totalFlows ?? 0
  const totalExecutions = stats?.totalExecutions ?? 0

  const metricCards = [
    {
      title: 'Instâncias Conectadas',
      value: loading ? '—' : `${connectedInstances}/${instances.length}`,
      icon: <Smartphone size={20} />,
      color: 'text-success',
      bg: 'bg-success-muted',
      link: '/instances',
    },
    {
      title: 'Fluxos Ativos',
      value: loading ? '—' : `${activeFlows}/${totalFlows}`,
      icon: <Workflow size={20} />,
      color: 'text-gold',
      bg: 'bg-gold-muted',
      link: '/flows',
    },
    {
      title: 'Contatos',
      value: loading ? '—' : contactCount.toLocaleString('pt-BR'),
      icon: <Users size={20} />,
      color: 'text-info',
      bg: 'bg-info-muted',
      link: '/contacts',
    },
    {
      title: 'Execuções Totais',
      value: loading ? '—' : totalExecutions.toLocaleString('pt-BR'),
      icon: <TrendingUp size={20} />,
      color: 'text-warning',
      bg: 'bg-warning-muted',
      link: '/flows',
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Olá, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Bem-vindo ao seu painel de automação
          </p>
        </div>
        <Link to="/flows">
          <Button variant="primary" icon={<Zap size={16} />}>
            Novo Fluxo
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <Link key={idx} to={card.link}>
            <Card hover className="h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
                <ArrowRight size={14} className="text-text-muted" />
              </div>
              {loading ? (
                <Skeleton height={28} width="50%" className="mb-1" />
              ) : (
                <p className={`font-heading text-3xl font-bold ${card.color} mb-0.5`}>
                  {card.value}
                </p>
              )}
              <p className="text-sm text-text-secondary">{card.title}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Chart + Instances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Execuções (7 dias)</CardTitle>
            <Badge variant="gold">Em tempo real</Badge>
          </CardHeader>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Skeleton height={200} className="w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#8A8A8A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8A8A8A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="executions"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#F0C040' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Instances */}
        <Card>
          <CardHeader>
            <CardTitle>Instâncias</CardTitle>
            <Link to="/instances">
              <button className="text-xs text-gold hover:text-gold-soft transition-colors">Ver todas</button>
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton circle width={36} height={36} />
                  <div className="flex-1">
                    <Skeleton height={12} width="60%" className="mb-1" />
                    <Skeleton height={10} width="40%" />
                  </div>
                </div>
              ))
            ) : instances.length === 0 ? (
              <div className="text-center py-6">
                <Smartphone size={32} className="text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary mb-3">Nenhuma instância</p>
                <Link to="/instances">
                  <Button size="sm" variant="secondary">Conectar WhatsApp</Button>
                </Link>
              </div>
            ) : (
              instances.slice(0, 4).map((instance) => (
                <div key={instance.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-background-elevated flex items-center justify-center">
                    <Smartphone size={16} className="text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{instance.name}</p>
                    <p className="text-xs text-text-muted truncate">
                      {instance.phoneNumber ?? 'Sem número'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        instance.status === 'connected'
                          ? 'bg-success'
                          : instance.status === 'connecting' || instance.status === 'qr_ready'
                          ? 'bg-warning animate-pulse'
                          : 'bg-text-muted'
                      }`}
                    />
                    <span className="text-xs text-text-muted capitalize hidden sm:block">
                      {instance.status === 'connected' ? 'Conectado' :
                       instance.status === 'disconnected' ? 'Desconectado' :
                       instance.status === 'qr_ready' ? 'QR' : 'Conectando'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <div className="space-y-1">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton circle width={24} height={24} />
                <Skeleton height={12} className="flex-1" />
                <Skeleton height={12} width={80} />
              </div>
            ))
          ) : (stats?.recentExecutions ?? []).length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={32} className="text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-secondary">Nenhuma atividade ainda</p>
            </div>
          ) : (
            (stats?.recentExecutions ?? []).slice(0, 8).map((exec, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-elevated transition-colors">
                {exec.status === 'completed' ? (
                  <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                ) : exec.status === 'failed' ? (
                  <XCircle size={16} className="text-danger flex-shrink-0" />
                ) : (
                  <Clock size={16} className="text-warning flex-shrink-0" />
                )}
                <p className="text-sm text-text-primary flex-1">
                  Execução de fluxo{' '}
                  <span className={exec.status === 'completed' ? 'text-success' : exec.status === 'failed' ? 'text-danger' : 'text-warning'}>
                    {exec.status === 'completed' ? 'concluída' : exec.status === 'failed' ? 'falhou' : 'em andamento'}
                  </span>
                </p>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {formatRelativeTime(exec.startedAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
