import React, { useEffect, useState, useRef } from 'react'
import { Send, Search, Phone, MessageSquare, Loader2 } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Dropdown'
import { useSocket } from '../hooks/useSocket'
import { useInstanceStore } from '../stores/instanceStore'
import api from '../services/api'
import { Message } from '../types'
import { formatDateTime, formatRelativeTime } from '../lib/utils'

interface ConversationSummary {
  contactId: string
  contactName?: string | null
  contactPhone: string
  lastMessage: Message
  instanceName: string
  instanceId: string
}

export const Conversations: React.FC = () => {
  const { instances } = useInstanceStore()
  const { on } = useSocket()

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedConv, setSelectedConv] = useState<ConversationSummary | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [selectedInstance, setSelectedInstance] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/messages/conversations')
        const convs: Message[] = response.data

        const mapped = convs.map((msg) => ({
          contactId: msg.contactId ?? '',
          contactName: msg.contact?.name ?? null,
          contactPhone: msg.contact?.phone ?? '',
          lastMessage: msg,
          instanceName: msg.instance?.name ?? '',
          instanceId: msg.instanceId,
        }))
        setConversations(mapped.filter((c) => c.contactId && c.contactPhone))
      } catch {
        // silence
      } finally {
        setLoadingConvs(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedConv) return
    async function loadMessages() {
      setLoadingMsgs(true)
      try {
        const response = await api.get('/messages', {
          params: { contactId: selectedConv!.contactId, limit: 50 },
        })
        setMessages(response.data.messages.reverse())
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      } catch {
        // silence
      } finally {
        setLoadingMsgs(false)
      }
    }
    loadMessages()
  }, [selectedConv])

  useEffect(() => {
    const unsubscribe = on('message:new', (data: unknown) => {
      const msg = data as { instanceId: string; contact: { id: string; phone: string; name?: string }; message: { text: string; timestamp: number } }

      if (selectedConv && msg.contact.id === selectedConv.contactId) {
        const newMessage: Message = {
          id: Date.now().toString(),
          instanceId: msg.instanceId,
          contactId: msg.contact.id,
          direction: 'inbound',
          type: 'text',
          content: { text: msg.message.text },
          status: 'received',
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, newMessage])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    })
    return unsubscribe
  }, [on, selectedConv])

  const handleSend = async () => {
    if (!messageText.trim() || !selectedConv) return
    const instanceId = selectedInstance || selectedConv.instanceId
    if (!instanceId) return

    setSending(true)
    try {
      const response = await api.post('/messages/send', {
        instanceId,
        to: selectedConv.contactPhone,
        message: messageText.trim(),
      })
      setMessages((prev) => [...prev, response.data])
      setMessageText('')
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      // silence
    } finally {
      setSending(false)
    }
  }

  const filteredConvs = conversations.filter((c) =>
    !search || (c.contactName?.toLowerCase().includes(search.toLowerCase()) || c.contactPhone.includes(search))
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conversation List */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-border bg-background-card">
        <div className="p-3 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-2">Conversas</h2>
          <Input
            placeholder="Buscar..."
            leftIcon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-gold animate-spin" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare size={32} className="text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-secondary">Nenhuma conversa</p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const isSelected = selectedConv?.contactId === conv.contactId
              const lastText = (conv.lastMessage.content as { text?: string }).text ?? ''

              return (
                <button
                  key={conv.contactId}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-start gap-2.5 p-3 border-b border-border-subtle transition-colors text-left ${
                    isSelected ? 'bg-gold-muted border-l-2 border-l-gold' : 'hover:bg-background-elevated'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gold-muted flex items-center justify-center text-xs font-bold text-gold flex-shrink-0">
                    {conv.contactName ? conv.contactName[0].toUpperCase() : conv.contactPhone[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary font-body truncate">
                        {conv.contactName ?? conv.contactPhone}
                      </p>
                      <span className="text-xs text-text-muted font-body whitespace-nowrap ml-1">
                        {formatRelativeTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted font-body truncate">{lastText}</p>
                    <p className="text-xs text-text-muted font-body truncate">{conv.instanceName}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="text-text-muted mx-auto mb-3" />
              <h3 className="font-heading text-xl text-text-primary mb-1">Selecione uma conversa</h3>
              <p className="text-text-secondary text-sm">Clique em uma conversa para começar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background-card">
              <div className="w-10 h-10 rounded-full bg-gold-muted flex items-center justify-center text-sm font-bold text-gold">
                {selectedConv.contactName ? selectedConv.contactName[0].toUpperCase() : selectedConv.contactPhone[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary font-body">
                  {selectedConv.contactName ?? selectedConv.contactPhone}
                </h3>
                <p className="text-xs text-text-muted font-body flex items-center gap-1">
                  <Phone size={10} />
                  {selectedConv.contactPhone}
                </p>
              </div>
              <Select
                value={selectedInstance || selectedConv.instanceId}
                onChange={setSelectedInstance}
                options={instances.map((i) => ({ value: i.id, label: i.name }))}
                className="w-40"
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="text-gold animate-spin" />
                </div>
              ) : messages.map((msg) => {
                const isOutbound = msg.direction === 'outbound'
                const text = (msg.content as { text?: string }).text ?? ''

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm font-body shadow-sm ${
                        isOutbound
                          ? 'bg-gold text-text-inverse rounded-tr-sm'
                          : 'bg-background-card border border-border text-text-primary rounded-tl-sm'
                      }`}
                    >
                      <p className="leading-relaxed">{text}</p>
                      <p className={`text-xs mt-1 ${isOutbound ? 'text-text-inverse/70' : 'text-text-muted'}`}>
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border bg-background-card">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 bg-background-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary font-body outline-none focus:border-gold transition-colors placeholder-text-muted"
                  placeholder="Digite uma mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Send size={14} />}
                  loading={sending}
                  disabled={!messageText.trim()}
                  onClick={handleSend}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
