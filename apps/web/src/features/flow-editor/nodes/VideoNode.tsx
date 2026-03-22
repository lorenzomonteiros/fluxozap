import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Video } from 'lucide-react'

export const VideoNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div className={`flow-node min-w-[200px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-red-500/20 flex items-center justify-center">
          <Video size={12} className="text-red-400" />
        </div>
        <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Vídeo</span>
      </div>
      <div className="px-4 py-3">
        <div className="w-full h-16 rounded-lg bg-background-elevated flex items-center justify-center mb-2">
          <Video size={24} className="text-text-muted" />
        </div>
        {Boolean(data.caption) && (
          <p className="text-xs text-text-secondary font-body truncate">{String(data.caption)}</p>
        )}
        {!data.url && (
          <p className="text-xs text-text-muted font-body italic">URL não definida</p>
        )}
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: -5 }} />
    </div>
  )
}
