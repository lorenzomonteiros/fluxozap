import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Tag } from 'lucide-react'

export const TagActionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const action = data.action as 'add' | 'remove' ?? 'add'
  const tag = data.tag as string ?? ''

  return (
    <div className={`flow-node min-w-[180px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-pink-500/20 flex items-center justify-center">
          <Tag size={12} className="text-pink-400" />
        </div>
        <span className="text-xs font-semibold text-pink-400 uppercase tracking-wide">Tag</span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded font-body ${
              action === 'add' ? 'bg-success-muted text-success' : 'bg-danger-muted text-danger'
            }`}
          >
            {action === 'add' ? '+ Adicionar' : '- Remover'}
          </span>
          {tag && (
            <span className="text-xs text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded font-body">
              {tag}
            </span>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: -5 }} />
    </div>
  )
}
