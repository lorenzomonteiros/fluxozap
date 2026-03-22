import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Workflow,
  Edit2,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  Zap,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Input'
import { Toggle } from '../components/ui/Toggle'
import { Dropdown } from '../components/ui/Dropdown'
import { Select } from '../components/ui/Dropdown'
import { Skeleton } from '../components/ui/Skeleton'
import { flowsService } from '../services/flows.service'
import { instancesService } from '../services/instances.service'
import { useToast } from '../hooks/useToast'
import { useInstanceStore } from '../stores/instanceStore'
import { Flow, WhatsAppInstance } from '../types'
import { formatRelativeTime } from '../lib/utils'

const triggerLabels: Record<string, string> = {
  keyword: 'Palavra-chave',
  any_message: 'Qualquer mensagem',
  first_message: 'Primeira mensagem',
  button_reply: 'Resposta de botão',
  list_reply: 'Resposta de lista',
}

export const Flows: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)
  const { instances, setInstances } = useInstanceStore()
  const { toast } = useToast()

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; flow?: Flow }>({ open: false })
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    triggerType: 'keyword',
    triggerValue: '',
    instanceId: '',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [flowsData, instancesData] = await Promise.all([
          flowsService.getFlows(),
          instancesService.getInstances(),
        ])
        setFlows(flowsData)
        setInstances(instancesData)
      } catch {
        toast({ message: 'Erro ao carregar fluxos', variant: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setInstances, toast])

  const handleCreate = async () => {
    if (!createForm.name.trim()) return
    setCreating(true)
    try {
      const flow = await flowsService.createFlow({
        name: createForm.name.trim(),
        description: createForm.description || undefined,
        trigger: {
          type: createForm.triggerType,
          value: createForm.triggerValue || undefined,
          instanceId: createForm.instanceId || undefined,
        },
      })
      setFlows((prev) => [flow, ...prev])
      setCreateOpen(false)
      setCreateForm({ name: '', description: '', triggerType: 'keyword', triggerValue: '', instanceId: '' })
      toast({ message: 'Fluxo criado com sucesso!', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao criar fluxo', variant: 'error' })
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (flow: Flow, isActive: boolean) => {
    try {
      const updated = await flowsService.toggleFlow(flow.id, isActive)
      setFlows((prev) => prev.map((f) => (f.id === flow.id ? { ...f, isActive: updated.isActive } : f)))
      toast({
        message: `Fluxo ${isActive ? 'ativado' : 'desativado'}`,
        variant: 'success',
      })
    } catch {
      toast({ message: 'Erro ao atualizar fluxo', variant: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.flow) return
    try {
      await flowsService.deleteFlow(deleteModal.flow.id)
      setFlows((prev) => prev.filter((f) => f.id !== deleteModal.flow!.id))
      setDeleteModal({ open: false })
      toast({ message: 'Fluxo removido', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao remover fluxo', variant: 'error' })
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">Fluxos</h1>
          <p className="text-text-secondary text-sm mt-1">Automações de WhatsApp</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          Novo Fluxo
        </Button>
      </div>

      {/* Flows grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-background-card border border-border rounded-card p-5">
              <Skeleton height={14} width="60%" className="mb-2" />
              <Skeleton height={12} width="80%" className="mb-4" />
              <div className="flex gap-2">
                <Skeleton height={24} width={80} rounded />
                <Skeleton height={24} width={60} rounded />
              </div>
            </div>
          ))
        ) : flows.length === 0 ? (
          <div className="col-span-3 text-center py-16">
            <Workflow size={48} className="text-text-muted mx-auto mb-3" />
            <h3 className="font-heading text-xl text-text-primary mb-2">Nenhum fluxo ainda</h3>
            <p className="text-text-secondary text-sm mb-6">
              Crie seu primeiro fluxo de automação
            </p>
            <Button onClick={() => setCreateOpen(true)} icon={<Plus size={16} />}>
              Criar Fluxo
            </Button>
          </div>
        ) : (
          flows.map((flow) => (
            <Card key={flow.id} className="relative">
              {/* Active indicator */}
              {flow.isActive && (
                <div className="absolute top-4 right-4">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse block" />
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold-muted flex items-center justify-center flex-shrink-0">
                  <Workflow size={18} className="text-gold" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-medium text-text-primary font-body truncate">{flow.name}</h3>
                  {flow.description && (
                    <p className="text-xs text-text-muted font-body truncate mt-0.5">{flow.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={flow.isActive ? 'success' : 'default'} dot>
                  {flow.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant="secondary">
                  <Zap size={10} />
                  {triggerLabels[flow.trigger.type] ?? flow.trigger.type}
                </Badge>
                {flow.trigger.value && (
                  <Badge variant="gold">"{flow.trigger.value}"</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted font-body mb-4">
                <CheckCircle2 size={12} />
                <span>{flow.executionCount ?? 0} execuções</span>
                <span className="mx-1">•</span>
                <Clock size={12} />
                <span>{formatRelativeTime(flow.updatedAt)}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Toggle
                  checked={flow.isActive}
                  onChange={(checked) => handleToggle(flow, checked)}
                  size="sm"
                  label={flow.isActive ? 'Ativo' : 'Inativo'}
                />

                <div className="flex items-center gap-1">
                  <Link to={`/flows/${flow.id}/edit`}>
                    <Button size="sm" variant="ghost" icon={<Edit2 size={14} />}>
                      Editar
                    </Button>
                  </Link>
                  <Dropdown
                    trigger={
                      <Button size="sm" variant="ghost">
                        <MoreVertical size={14} />
                      </Button>
                    }
                    items={[
                      { label: 'Duplicar', value: 'duplicate', icon: <Workflow size={14} /> },
                      { label: flow.isActive ? 'Pausar' : 'Ativar', value: 'toggle', icon: flow.isActive ? <Pause size={14} /> : <Play size={14} /> },
                      { label: 'Excluir', value: 'delete', icon: <Trash2 size={14} />, danger: true },
                    ]}
                    onSelect={(value) => {
                      if (value === 'toggle') handleToggle(flow, !flow.isActive)
                      if (value === 'delete') setDeleteModal({ open: true, flow })
                    }}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Criar Novo Fluxo" size="lg">
        <div className="space-y-4">
          <Input
            label="Nome do fluxo"
            placeholder="Ex: Boas-vindas"
            fullWidth
            value={createForm.name}
            onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
          />

          <Textarea
            label="Descrição (opcional)"
            placeholder="Descreva o que este fluxo faz..."
            fullWidth
            value={createForm.description}
            onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
          />

          <Select
            label="Tipo de gatilho"
            value={createForm.triggerType}
            onChange={(v) => setCreateForm((f) => ({ ...f, triggerType: v }))}
            options={[
              { value: 'keyword', label: 'Palavra-chave' },
              { value: 'any_message', label: 'Qualquer mensagem' },
              { value: 'first_message', label: 'Primeira mensagem' },
            ]}
          />

          {createForm.triggerType === 'keyword' && (
            <Input
              label="Palavra-chave"
              placeholder="Ex: oi, olá, começar"
              fullWidth
              value={createForm.triggerValue}
              onChange={(e) => setCreateForm((f) => ({ ...f, triggerValue: e.target.value }))}
              hint="O fluxo será acionado quando a mensagem contiver esta palavra"
            />
          )}

          <Select
            label="Instância (opcional)"
            value={createForm.instanceId}
            onChange={(v) => setCreateForm((f) => ({ ...f, instanceId: v }))}
            options={[
              { value: '', label: 'Todas as instâncias' },
              ...instances.map((i: WhatsAppInstance) => ({ value: i.id, label: i.name })),
            ]}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button loading={creating} onClick={handleCreate}>Criar Fluxo</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Excluir Fluxo"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Tem certeza que deseja excluir o fluxo{' '}
            <strong className="text-text-primary">"{deleteModal.flow?.name}"</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false })}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
