import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { StopCircle } from 'lucide-react'

export const EndNode: React.FC<NodeProps> = ({ selected }) => {
  return (
    <div className={`flow-node min-w-[140px] ${selected ? 'selected' : ''}`}>
      <div className="flex flex-col items-center gap-2 px-4 py-4">
        <div className="w-10 h-10 rounded-full bg-text-muted/20 flex items-center justify-center">
          <StopCircle size={20} className="text-text-muted" />
        </div>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide font-body">
          Fim do Fluxo
        </span>
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
    </div>
  )
}
