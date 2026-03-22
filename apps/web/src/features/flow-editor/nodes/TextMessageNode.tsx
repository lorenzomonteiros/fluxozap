import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { MessageSquare } from 'lucide-react'

export const TextMessageNode: React.FC<NodeProps> = ({ data, selected }) => {
  const message = data.message as string ?? ''

  return (
    <div className={`flow-node min-w-[200px] max-w-[280px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
          <MessageSquare size={12} className="text-blue-400" />
        </div>
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Mensagem</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-text-primary font-body line-clamp-3 leading-relaxed">
          {message || <span className="text-text-muted italic">Mensagem vazia...</span>}
        </p>
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: -5 }} />
    </div>
  )
}
