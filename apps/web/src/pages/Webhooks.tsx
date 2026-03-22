import React, { useEffect, useState } from 'react'
import { Plus, Webhook as WebhookIcon, Trash2, Edit2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Toggle } from '../components/ui/Toggle'
import { Skeleton } from '../components/ui/Skeleton'
import { webhooksService } from '../services/webhooks.service'
import { useToast } from '../hooks/useToast'
import { Webhook, WebhookLog, WebhookEvent } from '../types'
import { formatRelativeTime, formatDateTime } from '../lib/utils'

const ALL_EVENTS = [
  'message.received',
  'message.sent',
  'flow.started',
  'flow.completed',
  'flow.failed',
  'contact.created',
  'instance.connected',
  'instance.disconnected',
]

export const Webhooks: React.FC = () => {
  const { toast } = useToast()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editWebhook, setEditWebhook] = useState<Webhook | null>(null)
  const [logsModal, setLogsModal] = useState<{ open: boolean; webhookId: string; name: string }>({ open: false, webhookId: '', name: '' })
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [availableEvents, setAvailableEvents] = useState<WebhookEvent[]>([])
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
    isActive: true,
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [ws, events] = await Promise.all([
          webhooksService.getWebhooks(),
          webhooksService.getAvailableEvents(),
        ])
        setWebhooks(ws)
        setAvailableEvents(events)
      } catch {
        toast({ message: 'Erro ao carregar webhooks', variant: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const openEdit = (webhook: Webhook) => {
    setEditWebhook(webhook)
    setFormData({
      name: webhook.name,
      url: webhook.url,
      secret: webhook.secret ?? '',
      events: webhook.events,
      isActive: webhook.isActive,
    })
    setCreateOpen(true)
  }

  const openCreate = () => {
    setEditWebhook(null)
    setFormData({ name: '', url: '', secret: '', events: [], isActive: true })
    setCreateOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.url.trim() || formData.events.length === 0) {
      toast({ message: 'Preencha todos os campos obrigatórios', variant: 'warning' })
      return
    }
    setCreating(true)
    try {
      if (editWebhook) {
        const updated = await webhooksService.updateWebhook(editWebhook.id, formData)
        setWebhooks((prev) => prev.map((w) => w.id === editWebhook.id ? updated : w))
        toast({ message: 'Webhook atualizado!', variant: 'success' })
      } else {
        const webhook = await webhooksService.createWebhook({
          name: formData.name,
          url: formData.url,
          secret: formData.secret || undefined,
          events: formData.events,
        })
        setWebhooks((prev) => [webhook, ...prev])
        toast({ message: 'Webhook criado!', variant: 'success' })
      }
      setCreateOpen(false)
    } catch {
      toast({ message: 'Erro ao salvar webhook', variant: 'error' })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await webhooksService.deleteWebhook(id)
      setWebhooks((prev) => prev.filter((w) => w.id !== id))
      toast({ message: 'Webhook removido', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao remover webhook', variant: 'error' })
    }
  }

  const handleToggle = async (webhook: Webhook, isActive: boolean) => {
    try {
      const updated = await webhooksService.updateWebhook(webhook.id, { isActive })
      setWebhooks((prev) => prev.map((w) => w.id === webhook.id ? updated : w))
    } catch {
      toast({ message: 'Erro ao atualizar webhook', variant: 'error' })
    }
  }

  const openLogs = async (webhook: Webhook) => {
    setLogsModal({ open: true, webhookId: webhook.id, name: webhook.name })
    setLoadingLogs(true)
    try {
      const data = await webhooksService.getWebhookLogs(webhook.id)
      setLogs(data)
    } catch {
      toast({ message: 'Erro ao carregar logs', variant: 'error' })
    } finally {
      setLoadingLogs(false)
    }
  }

  const toggleEvent = (event: string) => {
    setFormData((f) => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter((e) => e !== event) : [...f.events, event],
    }))
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">Webhooks</h1>
          <p className="text-text-secondary text-sm mt-1">Enviar eventos para sistemas externos</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Novo Webhook</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-background-card border border-border rounded-card p-5">
              <Skeleton height={14} width="50%" className="mb-2" />
              <Skeleton height={12} width="70%" className="mb-4" />
              <div className="flex gap-2">
                <Skeleton height={24} width={60} rounded />
                <Skeleton height={24} width={80} rounded />
              </div>
            </div>
          ))
        ) : webhooks.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <WebhookIcon size={48} className="text-text-muted mx-auto mb-3" />
            <h3 className="font-heading text-xl text-text-primary mb-2">Nenhum webhook</h3>
            <p className="text-text-secondary text-sm mb-6">Crie webhooks para integrar com sistemas externos</p>
            <Button onClick={openCreate} icon={<Plus size={16} />}>Criar Webhook</Button>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <WebhookIcon size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary font-body">{webhook.name}</h3>
                    <p className="text-xs text-text-muted font-body truncate max-w-[180px]">{webhook.url}</p>
                  </div>
                </div>
                <Badge variant={webhook.isActive ? 'success' : 'default'} dot>
                  {webhook.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {webhook.events.slice(0, 4).map((event) => (
                  <Badge key={event} variant="secondary" className="text-xs">{event}</Badge>
                ))}
                {webhook.events.length > 4 && (
                  <Badge variant="default" className="text-xs">+{webhook.events.length - 4}</Badge>
                )}
              </div>

              <p className="text-xs text-text-muted font-body mb-4">
                Criado {formatRelativeTime(webhook.createdAt)}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Toggle
                  checked={webhook.isActive}
                  onChange={(v) => handleToggle(webhook, v)}
                  size="sm"
                />
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openLogs(webhook)} icon={<ChevronRight size={14} />}>
                    Logs
                  </Button>
                  <Button size="sm" variant="ghost" icon={<Edit2 size={14} />} onClick={() => openEdit(webhook)} />
                  <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => handleDelete(webhook.id)} className="text-danger hover:text-danger" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title={editWebhook ? 'Editar Webhook' : 'Novo Webhook'} size="lg">
        <div className="space-y-4">
          <Input label="Nome" placeholder="Meu Webhook" fullWidth value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} />
          <Input label="URL" placeholder="https://..." fullWidth value={formData.url} onChange={(e) => setFormData((f) => ({ ...f, url: e.target.value }))} />
          <Input label="Secret (opcional)" placeholder="Chave secreta para HMAC" fullWidth value={formData.secret} onChange={(e) => setFormData((f) => ({ ...f, secret: e.target.value }))} hint="Usado para validar a assinatura das requisições" />

          <div>
            <label className="text-sm font-medium text-text-secondary font-body block mb-2">Eventos</label>
            <div className="grid grid-cols-2 gap-2">
              {(availableEvents.length > 0 ? availableEvents : ALL_EVENTS.map((e) => ({ event: e, description: '' }))).map((eventObj) => {
                const event = typeof eventObj === 'string' ? eventObj : eventObj.event
                const isSelected = formData.events.includes(event)
                return (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`text-left p-2.5 rounded-lg border text-xs font-body transition-colors ${
                      isSelected ? 'border-gold bg-gold-muted text-gold' : 'border-border text-text-secondary hover:border-gold/50'
                    }`}
                  >
                    {event}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button loading={creating} onClick={handleSave}>{editWebhook ? 'Salvar' : 'Criar'}</Button>
          </div>
        </div>
      </Modal>

      {/* Logs Modal */}
      <Modal isOpen={logsModal.open} onClose={() => setLogsModal((m) => ({ ...m, open: false }))} title={`Logs — ${logsModal.name}`} size="xl">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-text-secondary text-sm py-8">Nenhum log ainda</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-background-elevated rounded-lg border border-border-subtle">
                {log.success ? (
                  <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">{log.event}</Badge>
                    {log.statusCode && (
                      <Badge variant={log.success ? 'success' : 'danger'} className="text-xs">
                        {log.statusCode}
                      </Badge>
                    )}
                    <span className="text-xs text-text-muted ml-auto">{formatDateTime(log.createdAt)}</span>
                  </div>
                  {log.response && (
                    <p className="text-xs text-text-muted font-body truncate">{log.response}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}
