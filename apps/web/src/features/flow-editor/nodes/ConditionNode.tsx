import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'

export const ConditionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const operatorLabels: Record<string, string> = {
    equals: '=',
    not_equals: '≠',
    contains: 'contém',
    not_contains: 'não contém',
    starts_with: 'começa com',
    ends_with: 'termina com',
    exists: 'existe',
    not_exists: 'não existe',
  }

  const op = data.operator as string ?? 'equals'

  return (
    <div className={`flow-node min-w-[220px] ${selected ? 'selected' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-teal-500/20 flex items-center justify-center">
          <GitBranch size={12} className="text-teal-400" />
        </div>
        <span className="text-xs font-semibold text-teal-400 uppercase tracking-wide">Condição</span>
      </div>
      <div className="px-4 py-3">
        <div className="bg-background-elevated rounded-lg p-2.5 text-xs font-body">
          <span className="text-text-secondary">se </span>
          <span className="text-teal-400 font-medium">{data.variable as string || '?'}</span>
          <span className="text-text-secondary"> {operatorLabels[op]} </span>
          {Boolean(data.value) && <span className="text-text-primary">"{String(data.value)}"</span>}
        </div>
      </div>
      <div className="flex justify-between px-4 pb-3 text-xs font-body">
        <span className="text-success">Verdadeiro ↙</span>
        <span className="text-danger">↘ Falso</span>
      </div>
      <Handle type="target" position={Position.Top} id="default" style={{ top: -5 }} />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ bottom: -5, left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ bottom: -5, left: '75%' }}
      />
    </div>
  )
}
