import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Image } from 'lucide-react'

export const ImageNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div className={`flow-node min-w-[200px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center">
          <Image size={12} className="text-green-400" />
        </div>
        <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Imagem</span>
      </div>
      <div className="px-4 py-3">
        {data.url ? (
          <div className="w-full h-20 rounded-lg overflow-hidden bg-background-elevated mb-2">
            <img
              src={data.url as string}
              alt="preview"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        ) : (
          <div className="w-full h-16 rounded-lg bg-background-elevated flex items-center justify-center mb-2">
            <Image size={20} className="text-text-muted" />
          </div>
        )}
        {Boolean(data.caption) && (
          <p className="text-xs text-text-secondary font-body truncate">{String(data.caption)}</p>
        )}
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: -5 }} />
    </div>
  )
}
