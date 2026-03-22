import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Variable } from 'lucide-react'

export const SaveVariableNode: React.FC<NodeProps> = ({ data, selected }) => {
  const source = data.source as string ?? 'static'
  const sourceLabels: Record<string, string> = {
    last_message: 'Última mensagem',
    static: 'Valor fixo',
    expression: 'Expressão',
  }

  return (
    <div className={`flow-node min-w-[200px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center">
          <Variable size={12} className="text-cyan-400" />
        </div>
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">Variável</span>
      </div>
      <div className="px-4 py-3">
        <div className="text-xs font-body space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Salvar em:</span>
            <span className="text-cyan-400 font-medium">{data.variableName as string || '?'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Fonte:</span>
            <span className="text-text-secondary">{sourceLabels[source]}</span>
          </div>
          {source === 'static' && Boolean(data.value) && (
            <div className="text-text-primary bg-background-elevated rounded px-2 py-1 mt-1 truncate">
              "{String(data.value)}"
            </div>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: -5 }} />
    </div>
  )
}
