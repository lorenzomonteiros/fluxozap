import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { FileText } from 'lucide-react'

export const DocumentNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div className={`flow-node min-w-[200px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-yellow-500/20 flex items-center justify-center">
          <FileText size={12} className="text-yellow-400" />
        </div>
        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">Documento</span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-background-elevated rounded-lg p-2.5">
          <div className="w-8 h-10 rounded bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary font-body truncate">
              {data.filename as string || 'documento.pdf'}
            </p>
            <p className="text-xs text-text-muted font-body">Documento</p>
          </div>
        </div>
        {Boolean(data.caption) && (
          <p className="text-xs text-text-secondary font-body mt-2 truncate">{String(data.caption)}</p>
        )}
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: -5 }} />
    </div>
  )
}
