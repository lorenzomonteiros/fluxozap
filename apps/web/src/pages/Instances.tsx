import React, { useEffect, useState, useCallback } from 'react'
import {
  Smartphone,
  Plus,
  Trash2,
  RefreshCw,
  WifiOff,
  Wifi,
  QrCode,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Dropdown } from '../components/ui/Dropdown'
import { Skeleton } from '../components/ui/Skeleton'
import { instancesService } from '../services/instances.service'
import { useInstanceStore } from '../stores/instanceStore'
import { useSocket } from '../hooks/useSocket'
import { useToast } from '../hooks/useToast'
import { WhatsAppInstance, InstanceStatusUpdate } from '../types'
import { formatRelativeTime } from '../lib/utils'

type InstanceStatus = WhatsAppInstance['status']

function StatusBadge({ status }: { status: InstanceStatus }) {
  const map: Record<InstanceStatus, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'default' }> = {
    connected: { label: 'Conectado', variant: 'success' },
    disconnected: { label: 'Desconectado', variant: 'default' },
    connecting: { label: 'Conectando', variant: 'warning' },
    qr_ready: { label: 'QR Disponível', variant: 'info' },
  }
  const cfg = map[status] ?? { label: status, variant: 'default' }
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
}

export const Instances: React.FC = () => {
  const { instances, setInstances, addInstance, removeInstance, updateInstanceStatus } = useInstanceStore()
  const { joinInstance, on } = useSocket()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [qrModal, setQrModal] = useState<{ open: boolean; instanceId: string; qr?: string; name: string }>({
    open: false,
    instanceId: '',
    qr: undefined,
    name: '',
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await instancesService.getInstances()
        setInstances(data)
        data.forEach((i: WhatsAppInstance) => {
          joinInstance(i.id)
          if (i.status === 'qr_ready') {
            instancesService.getInstanceStatus(i.id).then((status) => {
              if (status.qr && qrModal.instanceId === i.id) {
                setQrModal((prev) => ({ ...prev, qr: status.qr }))
              }
            })
          }
        })
      } catch {
        toast({ message: 'Erro ao carregar instâncias', variant: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setInstances, joinInstance, toast])

  useEffect(() => {
    const unsubscribe = on('instance:status', (data) => {
      const { instanceId, status, qr } = data as InstanceStatusUpdate
      updateInstanceStatus(instanceId, status)

      if (qr && qrModal.instanceId === instanceId) {
        setQrModal((prev) => ({ ...prev, qr, open: true }))
      }

      if (status === 'connected' && qrModal.instanceId === instanceId) {
        setQrModal((prev) => ({ ...prev, open: false }))
        toast({ message: 'WhatsApp conectado com sucesso!', variant: 'success' })
      }
    })
    return unsubscribe
  }, [on, updateInstanceStatus, qrModal.instanceId, toast])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const instance = await instancesService.createInstance(newName.trim())
      addInstance(instance)
      joinInstance(instance.id)
      setCreateOpen(false)
      setNewName('')
      toast({ message: 'Instância criada com sucesso!', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao criar instância', variant: 'error' })
    } finally {
      setCreating(false)
    }
  }

  const handleConnect = useCallback(async (instance: WhatsAppInstance) => {
    setActionLoading(instance.id)
    try {
      await instancesService.connectInstance(instance.id)
      updateInstanceStatus(instance.id, 'connecting')
      setQrModal({ open: true, instanceId: instance.id, qr: undefined, name: instance.name })

      // Poll for QR
      const pollQR = async (attempts = 0): Promise<void> => {
        if (attempts > 15) return
        const status = await instancesService.getInstanceStatus(instance.id)
        if (status.qr) {
          setQrModal((prev) => ({ ...prev, qr: status.qr }))
        } else if (status.status === 'connected') {
          setQrModal((prev) => ({ ...prev, open: false }))
        } else {
          setTimeout(() => pollQR(attempts + 1), 2000)
        }
      }
      setTimeout(() => pollQR(), 2000)
    } catch {
      toast({ message: 'Erro ao conectar instância', variant: 'error' })
    } finally {
      setActionLoading(null)
    }
  }, [updateInstanceStatus, toast])

  const handleDisconnect = async (id: string) => {
    setActionLoading(id)
    try {
      await instancesService.disconnectInstance(id)
      updateInstanceStatus(id, 'disconnected')
      toast({ message: 'Instância desconectada', variant: 'info' })
    } catch {
      toast({ message: 'Erro ao desconectar', variant: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    try {
      await instancesService.deleteInstance(id)
      removeInstance(id)
      toast({ message: 'Instância removida', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao remover instância', variant: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">Instâncias WhatsApp</h1>
          <p className="text-text-secondary text-sm mt-1">
            Gerencie suas conexões WhatsApp
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          Nova Instância
        </Button>
      </div>

      {/* Instances grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-background-card border border-border rounded-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton circle width={44} height={44} />
                <div className="flex-1">
                  <Skeleton height={14} width="50%" className="mb-2" />
                  <Skeleton height={12} width="30%" />
                </div>
              </div>
              <Skeleton height={32} className="w-full" />
            </div>
          ))
        ) : instances.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <Smartphone size={48} className="text-text-muted mx-auto mb-3" />
            <h3 className="font-heading text-xl text-text-primary mb-2">Nenhuma instância ainda</h3>
            <p className="text-text-secondary text-sm mb-6">
              Crie sua primeira instância para conectar um número WhatsApp
            </p>
            <Button onClick={() => setCreateOpen(true)} icon={<Plus size={16} />}>
              Criar Instância
            </Button>
          </div>
        ) : (
          instances.map((instance) => (
            <Card key={instance.id} className="relative overflow-hidden">
              {/* Status strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 ${
                  instance.status === 'connected'
                    ? 'bg-success'
                    : instance.status === 'connecting' || instance.status === 'qr_ready'
                    ? 'bg-warning'
                    : 'bg-border'
                }`}
              />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-background-elevated flex items-center justify-center">
                    <Smartphone size={20} className="text-text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary font-body">{instance.name}</h3>
                    <p className="text-xs text-text-muted font-body">
                      {instance.phoneNumber ? `+${instance.phoneNumber}` : 'Sem número'}
                    </p>
                  </div>
                </div>
                <StatusBadge status={instance.status} />
              </div>

              {instance.profileName && (
                <p className="text-xs text-text-secondary font-body mb-3">
                  Perfil: {instance.profileName}
                </p>
              )}

              <p className="text-xs text-text-muted font-body mb-4">
                Criado {formatRelativeTime(instance.createdAt)}
              </p>

              <div className="flex items-center gap-2">
                {instance.status === 'disconnected' && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Wifi size={14} />}
                    loading={actionLoading === instance.id}
                    onClick={() => handleConnect(instance)}
                  >
                    Conectar
                  </Button>
                )}

                {(instance.status === 'connecting' || instance.status === 'qr_ready') && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<QrCode size={14} />}
                      onClick={() => setQrModal({ open: true, instanceId: instance.id, qr: undefined, name: instance.name })}
                    >
                      Ver QR Code
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<WifiOff size={14} />}
                      loading={actionLoading === instance.id}
                      onClick={() => handleDisconnect(instance.id)}
                    >
                      Cancelar
                    </Button>
                  </>
                )}

                {instance.status === 'connected' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<WifiOff size={14} />}
                    loading={actionLoading === instance.id}
                    onClick={() => handleDisconnect(instance.id)}
                  >
                    Desconectar
                  </Button>
                )}

                <Dropdown
                  trigger={
                    <Button size="sm" variant="ghost" className="ml-auto">
                      •••
                    </Button>
                  }
                  items={[
                    {
                      label: 'Reconectar',
                      value: 'reconnect',
                      icon: <RefreshCw size={14} />,
                      disabled: instance.status === 'connected',
                    },
                    {
                      label: 'Excluir instância',
                      value: 'delete',
                      icon: <Trash2 size={14} />,
                      danger: true,
                    },
                  ]}
                  onSelect={(value) => {
                    if (value === 'reconnect') handleConnect(instance)
                    if (value === 'delete') handleDelete(instance.id)
                  }}
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nova Instância">
        <div className="space-y-4">
          <Input
            label="Nome da instância"
            placeholder="Ex: Suporte Principal"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            hint="Escolha um nome fácil de identificar"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button loading={creating} onClick={handleCreate}>Criar</Button>
          </div>
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal
        isOpen={qrModal.open}
        onClose={() => setQrModal((prev) => ({ ...prev, open: false }))}
        title={`Conectar: ${qrModal.name}`}
        size="sm"
      >
        <div className="text-center space-y-4">
          {qrModal.qr ? (
            <>
              <div className="qr-container inline-block">
                <img src={qrModal.qr} alt="QR Code" className="w-56 h-56 mx-auto" />
              </div>
              <p className="text-sm text-text-secondary">
                Abra o WhatsApp no seu celular, vá em{' '}
                <strong className="text-text-primary">Aparelhos conectados</strong> e escaneie o QR code acima.
              </p>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
              <p className="text-text-secondary text-sm">Gerando QR Code...</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
