import React from 'react'
import {
  Zap,
  MessageSquare,
  Image,
  Music,
  Video,
  FileText,
  Clock,
  GitBranch,
  Tag,
  Variable,
  Webhook,
  StopCircle,
} from 'lucide-react'

interface PaletteItem {
  type: string
  label: string
  description: string
  icon: React.ReactNode
  color: string
  defaultData: Record<string, unknown>
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'text_message',
    label: 'Mensagem de Texto',
    description: 'Enviar mensagem de texto',
    icon: <MessageSquare size={16} />,
    color: 'text-blue-400 bg-blue-500/10',
    defaultData: { label: 'Mensagem', message: '' },
  },
  {
    type: 'image',
    label: 'Imagem',
    description: 'Enviar uma imagem',
    icon: <Image size={16} />,
    color: 'text-green-400 bg-green-500/10',
    defaultData: { label: 'Imagem', url: '', caption: '' },
  },
  {
    type: 'audio',
    label: 'Áudio',
    description: 'Enviar mensagem de áudio',
    icon: <Music size={16} />,
    color: 'text-orange-400 bg-orange-500/10',
    defaultData: { label: 'Áudio', url: '' },
  },
  {
    type: 'video',
    label: 'Vídeo',
    description: 'Enviar um vídeo',
    icon: <Video size={16} />,
    color: 'text-red-400 bg-red-500/10',
    defaultData: { label: 'Vídeo', url: '', caption: '' },
  },
  {
    type: 'document',
    label: 'Documento',
    description: 'Enviar um arquivo',
    icon: <FileText size={16} />,
    color: 'text-yellow-400 bg-yellow-500/10',
    defaultData: { label: 'Documento', url: '', filename: 'arquivo.pdf' },
  },
  {
    type: 'delay',
    label: 'Aguardar',
    description: 'Adicionar atraso',
    icon: <Clock size={16} />,
    color: 'text-purple-400 bg-purple-500/10',
    defaultData: { label: 'Aguardar', duration: 5, unit: 'seconds' },
  },
  {
    type: 'condition',
    label: 'Condição',
    description: 'Lógica condicional',
    icon: <GitBranch size={16} />,
    color: 'text-teal-400 bg-teal-500/10',
    defaultData: { label: 'Condição', variable: '', operator: 'equals', value: '' },
  },
  {
    type: 'tag_action',
    label: 'Ação de Tag',
    description: 'Adicionar/remover tag',
    icon: <Tag size={16} />,
    color: 'text-pink-400 bg-pink-500/10',
    defaultData: { label: 'Tag', action: 'add', tag: '' },
  },
  {
    type: 'save_variable',
    label: 'Salvar Variável',
    description: 'Guardar valor',
    icon: <Variable size={16} />,
    color: 'text-cyan-400 bg-cyan-500/10',
    defaultData: { label: 'Variável', variableName: '', source: 'last_message', value: '' },
  },
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Chamar URL externa',
    icon: <Webhook size={16} />,
    color: 'text-indigo-400 bg-indigo-500/10',
    defaultData: { label: 'Webhook', url: '', method: 'POST', headers: {}, body: '' },
  },
  {
    type: 'end',
    label: 'Fim',
    description: 'Encerrar o fluxo',
    icon: <StopCircle size={16} />,
    color: 'text-text-muted bg-background-elevated',
    defaultData: { label: 'Fim' },
  },
]

interface NodePaletteProps {
  onAddNode: (type: string, data: Record<string, unknown>) => void
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const handleDragStart = (
    e: React.DragEvent,
    type: string,
    data: Record<string, unknown>
  ) => {
    e.dataTransfer.setData('application/flowzap-node', JSON.stringify({ type, data }))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-56 bg-background-card border-r border-border flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Blocos</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {PALETTE_ITEMS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type, item.defaultData)}
            onClick={() => onAddNode(item.type, item.defaultData)}
            className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-background-elevated cursor-grab active:cursor-grabbing transition-all duration-150 group border border-transparent hover:border-border"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary font-body leading-tight">{item.label}</p>
              <p className="text-xs text-text-muted font-body leading-tight">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gold-muted border border-border">
          <Zap size={12} className="text-gold flex-shrink-0" />
          <p className="text-xs text-text-secondary font-body">Arraste blocos para o canvas</p>
        </div>
      </div>
    </div>
  )
}
