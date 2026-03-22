import React, { useEffect, useState, useCallback } from 'react'
import {
  Users,
  Plus,
  Search,
  Download,
  Upload,
  Trash2,
  Tag,
  MoreVertical,
  Phone,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Toggle } from '../components/ui/Toggle'
import { Dropdown } from '../components/ui/Dropdown'
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton'
import { contactsService } from '../services/contacts.service'
import { useToast } from '../hooks/useToast'
import { Contact, ContactsResponse } from '../types'
import { formatDate, formatRelativeTime, debounce } from '../lib/utils'

export const Contacts: React.FC = () => {
  const { toast } = useToast()
  const [data, setData] = useState<ContactsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [bulkTagOpen, setBulkTagOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ phone: '', name: '', email: '', tags: '' })
  const [bulkTagForm, setBulkTagForm] = useState({ tags: '', action: 'add' as 'add' | 'remove' })
  const [creating, setCreating] = useState(false)
  const [importCsv, setImportCsv] = useState('')
  const [importing, setImporting] = useState(false)

  const fetchContacts = useCallback(
    async (searchTerm: string, pageNum: number) => {
      setLoading(true)
      try {
        const result = await contactsService.getContacts({
          search: searchTerm || undefined,
          page: pageNum,
          limit: 20,
        })
        setData(result)
      } catch {
        toast({ message: 'Erro ao carregar contatos', variant: 'error' })
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setPage(1)
      fetchContacts(value, 1)
    }, 400),
    [fetchContacts]
  )

  useEffect(() => {
    fetchContacts(search, page)
  }, [page])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    debouncedSearch(value)
  }

  const handleCreate = async () => {
    if (!createForm.phone.trim()) return
    setCreating(true)
    try {
      const contact = await contactsService.createContact({
        phone: createForm.phone.trim(),
        name: createForm.name || undefined,
        email: createForm.email || undefined,
        tags: createForm.tags ? createForm.tags.split(',').map((t) => t.trim()) : [],
      })
      setData((prev) => prev ? {
        ...prev,
        contacts: [contact, ...prev.contacts],
        pagination: { ...prev.pagination, total: prev.pagination.total + 1 },
      } : null)
      setCreateOpen(false)
      setCreateForm({ phone: '', name: '', email: '', tags: '' })
      toast({ message: 'Contato criado!', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao criar contato', variant: 'error' })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await contactsService.deleteContact(id)
      setData((prev) => prev ? {
        ...prev,
        contacts: prev.contacts.filter((c) => c.id !== id),
        pagination: { ...prev.pagination, total: prev.pagination.total - 1 },
      } : null)
      if (selectedContact?.id === id) setSelectedContact(null)
      toast({ message: 'Contato removido', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao remover contato', variant: 'error' })
    }
  }

  const handleOptOut = async (contact: Contact, optOut: boolean) => {
    try {
      const updated = await contactsService.optOutContact(contact.id, optOut)
      setData((prev) => prev ? {
        ...prev,
        contacts: prev.contacts.map((c) => c.id === contact.id ? updated : c),
      } : null)
      if (selectedContact?.id === contact.id) setSelectedContact(updated)
    } catch {
      toast({ message: 'Erro ao atualizar opt-out', variant: 'error' })
    }
  }

  const handleExport = async () => {
    try {
      const csv = await contactsService.exportContacts()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contacts.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast({ message: 'Exportação iniciada!', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao exportar', variant: 'error' })
    }
  }

  const handleImport = async () => {
    if (!importCsv.trim()) return
    setImporting(true)
    try {
      const result = await contactsService.importContacts(importCsv)
      toast({ message: result.message, variant: 'success' })
      setImportOpen(false)
      setImportCsv('')
      fetchContacts(search, 1)
    } catch {
      toast({ message: 'Erro ao importar', variant: 'error' })
    } finally {
      setImporting(false)
    }
  }

  const handleBulkTag = async () => {
    if (!bulkTagForm.tags.trim() || selectedIds.size === 0) return
    try {
      const tags = bulkTagForm.tags.split(',').map((t) => t.trim())
      await contactsService.bulkTag(Array.from(selectedIds), tags, bulkTagForm.action)
      toast({ message: `Tags ${bulkTagForm.action === 'add' ? 'adicionadas' : 'removidas'}!`, variant: 'success' })
      setBulkTagOpen(false)
      setSelectedIds(new Set())
      fetchContacts(search, page)
    } catch {
      toast({ message: 'Erro ao aplicar tags', variant: 'error' })
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const contacts = data?.contacts ?? []
  const pagination = data?.pagination

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">Contatos</h1>
          <p className="text-text-secondary text-sm mt-1">
            {pagination ? `${pagination.total.toLocaleString('pt-BR')} contatos no total` : 'Gerenciar sua lista de contatos'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExport}>
            Exportar
          </Button>
          <Button variant="secondary" size="sm" icon={<Upload size={14} />} onClick={() => setImportOpen(true)}>
            Importar
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar por nome, telefone ou email..."
          leftIcon={<Search size={15} />}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary font-body">
              {selectedIds.size} selecionado(s)
            </span>
            <Button size="sm" variant="secondary" icon={<Tag size={14} />} onClick={() => setBulkTagOpen(true)}>
              Aplicar Tags
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              <X size={14} />
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-background-card border border-border rounded-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[32px,1fr,1fr,1fr,auto,auto] gap-4 px-4 py-3 border-b border-border bg-background-elevated">
          <div />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Nome / Telefone</span>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Email</span>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Tags</span>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Opt-out</span>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Criado</span>
        </div>

        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : contacts.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary text-sm">
              {search ? 'Nenhum contato encontrado' : 'Nenhum contato ainda'}
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="grid grid-cols-[32px,1fr,1fr,1fr,auto,auto] gap-4 px-4 py-3 border-b border-border-subtle hover:bg-background-elevated transition-colors items-center"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(contact.id)}
                onChange={() => toggleSelect(contact.id)}
                className="w-4 h-4 rounded border-border accent-gold cursor-pointer"
              />

              <button
                onClick={() => setSelectedContact(contact)}
                className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-gold-muted flex items-center justify-center text-xs font-bold text-gold flex-shrink-0">
                  {contact.name ? contact.name[0].toUpperCase() : contact.phone[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary font-body truncate">
                    {contact.name ?? '—'}
                  </p>
                  <p className="text-xs text-text-muted font-body flex items-center gap-1">
                    <Phone size={10} />
                    {contact.phone}
                  </p>
                </div>
              </button>

              <span className="text-sm text-text-secondary font-body truncate">
                {contact.email ? (
                  <span className="flex items-center gap-1">
                    <Mail size={12} />
                    {contact.email}
                  </span>
                ) : '—'}
              </span>

              <div className="flex flex-wrap gap-1">
                {(contact.tags as string[]).slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="gold" className="text-xs">{tag}</Badge>
                ))}
                {contact.tags.length > 3 && (
                  <Badge variant="default" className="text-xs">+{contact.tags.length - 3}</Badge>
                )}
              </div>

              <Toggle
                checked={contact.optOut}
                onChange={(v) => handleOptOut(contact, v)}
                size="sm"
              />

              <div className="flex items-center gap-1">
                <span className="text-xs text-text-muted font-body whitespace-nowrap">
                  {formatRelativeTime(contact.createdAt)}
                </span>
                <Dropdown
                  trigger={
                    <Button size="sm" variant="ghost">
                      <MoreVertical size={14} />
                    </Button>
                  }
                  items={[
                    { label: 'Ver detalhes', value: 'view' },
                    { label: 'Excluir', value: 'delete', icon: <Trash2 size={14} />, danger: true },
                  ]}
                  onSelect={(value) => {
                    if (value === 'view') setSelectedContact(contact)
                    if (value === 'delete') handleDelete(contact.id)
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary font-body">
            Página {page} de {pagination.pages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={<ChevronLeft size={14} />}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            />
            <Button
              size="sm"
              variant="secondary"
              iconRight={<ChevronRight size={14} />}
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Contact Drawer */}
      {selectedContact && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedContact(null)} />
          <div className="w-80 bg-background-card border-l border-border shadow-modal animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-heading text-lg font-semibold text-text-primary">Detalhes</h3>
              <Button size="sm" variant="ghost" onClick={() => setSelectedContact(null)}>
                <X size={16} />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-2xl font-bold text-text-inverse">
                  {selectedContact.name ? selectedContact.name[0].toUpperCase() : selectedContact.phone[0]}
                </div>
                <h4 className="font-heading text-xl font-semibold text-text-primary">
                  {selectedContact.name ?? 'Sem nome'}
                </h4>
                <p className="text-text-secondary text-sm">{selectedContact.phone}</p>
                <Badge variant={selectedContact.optOut ? 'danger' : 'success'} dot>
                  {selectedContact.optOut ? 'Opt-out' : 'Ativo'}
                </Badge>
              </div>

              <div className="space-y-3">
                {selectedContact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-text-muted" />
                    <span className="text-text-secondary">{selectedContact.email}</span>
                  </div>
                )}
                <div className="text-sm">
                  <p className="text-text-muted text-xs mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedContact.tags.length > 0
                      ? selectedContact.tags.map((tag) => (
                          <Badge key={tag} variant="gold">{tag}</Badge>
                        ))
                      : <span className="text-text-muted text-xs">Sem tags</span>
                    }
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-text-muted text-xs mb-1">Criado em</p>
                  <p className="text-text-secondary">{formatDate(selectedContact.createdAt)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  fullWidth
                  icon={<Trash2 size={14} />}
                  onClick={() => handleDelete(selectedContact.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Novo Contato">
        <div className="space-y-4">
          <Input label="Telefone" placeholder="+5511999999999" fullWidth value={createForm.phone} onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Nome (opcional)" placeholder="João Silva" fullWidth value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email (opcional)" placeholder="joao@email.com" fullWidth value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Tags (separar por vírgula)" placeholder="cliente, vip" fullWidth value={createForm.tags} onChange={(e) => setCreateForm((f) => ({ ...f, tags: e.target.value }))} />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button loading={creating} onClick={handleCreate}>Criar</Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={importOpen} onClose={() => setImportOpen(false)} title="Importar Contatos (CSV)" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Cole o conteúdo CSV abaixo. Colunas: <code className="text-gold">phone, name, email, tags</code>
          </p>
          <textarea
            className="w-full h-40 bg-background-elevated border border-border-subtle rounded-lg p-3 text-sm text-text-primary font-body outline-none focus:border-gold resize-none"
            placeholder="phone,name,email,tags&#10;+5511999999999,João Silva,joao@email.com,cliente"
            value={importCsv}
            onChange={(e) => setImportCsv(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancelar</Button>
            <Button loading={importing} onClick={handleImport}>Importar</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Tag Modal */}
      <Modal isOpen={bulkTagOpen} onClose={() => setBulkTagOpen(false)} title="Aplicar Tags em Massa">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">{selectedIds.size} contato(s) selecionado(s)</p>
          <Input label="Tags (separar por vírgula)" placeholder="cliente, vip" fullWidth value={bulkTagForm.tags} onChange={(e) => setBulkTagForm((f) => ({ ...f, tags: e.target.value }))} />
          <div className="flex gap-2">
            {(['add', 'remove'] as const).map((action) => (
              <button
                key={action}
                onClick={() => setBulkTagForm((f) => ({ ...f, action }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${bulkTagForm.action === action ? 'border-gold bg-gold-muted text-gold' : 'border-border text-text-secondary hover:border-gold/50'}`}
              >
                {action === 'add' ? 'Adicionar' : 'Remover'}
              </button>
            ))}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setBulkTagOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkTag}>Aplicar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
