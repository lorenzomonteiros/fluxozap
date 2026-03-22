import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Clock } from 'lucide-react'

export const DelayNode: React.FC<NodeProps> = ({ data, selected }) => {
  const unit = data.unit as string ?? 'seconds'
  const unitLabels: Record<string, string> = {
    seconds: 'segundo(s)',
    minutes: 'minuto(s)',
    hours: 'hora(s)',
  }

  return (
    <div className={`flow-node min-w-[180px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
          <Clock size={12} className="text-purple-400" />
        </div>
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Aguardar</span>
      </div>
      <div className="px-4 py-4 flex items-center justify-center">
        <div className="text-center">
          <span className="font-heading text-2xl font-bold text-purple-400">
            {data.duration as number || '—'}
          </span>
          <span className="text-xs text-text-secondary font-body ml-1">
            {unitLabels[unit]}
          </span>
        </div>
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: -5 }} />
    </div>
  )
}
