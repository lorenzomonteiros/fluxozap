import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Music } from 'lucide-react'

export const AudioNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div className={`flow-node min-w-[200px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-orange-500/20 flex items-center justify-center">
          <Music size={12} className="text-orange-400" />
        </div>
        <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Áudio</span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-background-elevated rounded-lg p-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Music size={14} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-secondary font-body truncate">
              {data.url ? (data.url as string).split('/').pop() : 'Áudio não definido'}
            </p>
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: -5 }} />
    </div>
  )
}
