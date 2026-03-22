import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Zap } from 'lucide-react'

export const TriggerNode: React.FC<NodeProps> = ({ data, selected }) => {
  const triggerType = data.triggerType as string ?? 'keyword'
  const triggerValue = data.triggerValue as string ?? ''

  const typeLabels: Record<string, string> = {
    keyword: 'Palavra-chave',
    any_message: 'Qualquer Mensagem',
    first_message: 'Primeira Mensagem',
    button_reply: 'Resposta de Botão',
    list_reply: 'Resposta de Lista',
  }

  return (
    <div className={`flow-node min-w-[200px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gold/20">
        <div className="w-6 h-6 rounded-md bg-gold-gradient flex items-center justify-center shadow-glow">
          <Zap size={12} className="text-text-inverse" />
        </div>
        <span className="text-xs font-semibold text-gold uppercase tracking-wide">Gatilho</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-text-primary font-body">
          {typeLabels[triggerType] ?? triggerType}
        </p>
        {triggerValue && (
          <p className="text-xs text-gold mt-1 font-body bg-gold-muted px-1.5 py-0.5 rounded inline-block">
            "{triggerValue}"
          </p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        style={{ bottom: -5 }}
      />
    </div>
  )
}
