import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Webhook } from 'lucide-react'

export const WebhookNode: React.FC<NodeProps> = ({ data, selected }) => {
  const method = data.method as string ?? 'POST'
  const url = data.url as string ?? ''

  const methodColors: Record<string, string> = {
    GET: 'text-green-400 bg-green-500/10',
    POST: 'text-blue-400 bg-blue-500/10',
    PUT: 'text-yellow-400 bg-yellow-500/10',
    PATCH: 'text-orange-400 bg-orange-500/10',
    DELETE: 'text-red-400 bg-red-500/10',
  }

  const urlDisplay = url.length > 30 ? `...${url.slice(-27)}` : url

  return (
    <div className={`flow-node min-w-[220px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
          <Webhook size={12} className="text-indigo-400" />
        </div>
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Webhook</span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded font-body ${methodColors[method] ?? 'text-text-secondary bg-background-elevated'}`}>
            {method}
          </span>
          {Boolean(data.saveResponseAs) && (
            <span className="text-xs text-text-muted font-body">→ {String(data.saveResponseAs)}</span>
          )}
        </div>
        {url ? (
          <p className="text-xs text-text-secondary font-body break-all">{urlDisplay}</p>
        ) : (
          <p className="text-xs text-text-muted font-body italic">URL não definida</p>
        )}
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: -5 }} />
    </div>
  )
}
