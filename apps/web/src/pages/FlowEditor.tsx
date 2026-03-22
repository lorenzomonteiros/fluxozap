import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
} from '@xyflow/react'
import { Save, ArrowLeft, Play, Pause, Loader2 } from 'lucide-react'
import { FlowCanvas } from '../features/flow-editor/FlowCanvas'
import { NodePalette } from '../features/flow-editor/NodePalette'
import { NodeConfigPanel } from '../features/flow-editor/NodeConfigPanel'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Toggle } from '../components/ui/Toggle'
import { flowsService } from '../services/flows.service'
import { useToast } from '../hooks/useToast'
import { Flow } from '../types'
import { generateId } from '../lib/utils'

export const FlowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [flow, setFlow] = useState<Flow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const data = await flowsService.getFlow(id!)
        setFlow(data)
        setNodes((data.nodes ?? []) as Node[])
        setEdges((data.edges ?? []) as Edge[])
      } catch {
        toast({ message: 'Erro ao carregar fluxo', variant: 'error' })
        navigate('/flows')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate, toast, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds))
    },
    [setEdges]
  )

  const onAddNode = useCallback(
    (type: string, defaultData: Record<string, unknown>) => {
      const newNode: Node = {
        id: generateId(),
        type,
        position: { x: 300 + Math.random() * 100, y: 300 + Math.random() * 100 },
        data: defaultData,
      }
      setNodes((nds) => [...nds, newNode])
      setSelectedNode(newNode)
    },
    [setNodes]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('application/flowzap-node')
      if (!raw) return
      const { type, data } = JSON.parse(raw)

      const reactFlowBounds = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const position = {
        x: e.clientX - reactFlowBounds.left - 100,
        y: e.clientY - reactFlowBounds.top - 40,
      }

      const newNode: Node = {
        id: generateId(),
        type,
        position,
        data,
      }
      setNodes((nds) => [...nds, newNode])
      setSelectedNode(newNode)
    },
    [setNodes]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onNodeClick = useCallback((node: Node) => {
    setSelectedNode(node)
  }, [])

  const onNodeDataUpdate = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: newData } : n))
      )
      setSelectedNode((prev) =>
        prev?.id === nodeId ? { ...prev, data: newData } : prev
      )
    },
    [setNodes]
  )

  const handleSave = async () => {
    if (!flow || !id) return
    setSaving(true)
    try {
      await flowsService.updateFlow(id, {
        nodes: nodes as Flow['nodes'],
        edges: edges as Flow['edges'],
      })
      toast({ message: 'Fluxo salvo com sucesso!', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao salvar fluxo', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (isActive: boolean) => {
    if (!flow || !id) return
    try {
      await flowsService.toggleFlow(id, isActive)
      setFlow((f) => f ? { ...f, isActive } : f)
      toast({
        message: `Fluxo ${isActive ? 'ativado' : 'desativado'}`,
        variant: 'success',
      })
    } catch {
      toast({ message: 'Erro ao atualizar fluxo', variant: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-gold animate-spin" />
          <p className="text-text-secondary text-sm font-body">Carregando editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-background-card border-b border-border flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/flows')}
        >
          Fluxos
        </Button>

        <div className="w-px h-5 bg-border" />

        <div className="flex-1">
          <h1 className="font-heading text-lg font-semibold text-text-primary leading-none">
            {flow?.name}
          </h1>
          {flow?.description && (
            <p className="text-xs text-text-muted font-body mt-0.5">{flow.description}</p>
          )}
        </div>

        <Badge variant={flow?.isActive ? 'success' : 'default'} dot>
          {flow?.isActive ? 'Ativo' : 'Inativo'}
        </Badge>

        <Toggle
          checked={flow?.isActive ?? false}
          onChange={handleToggle}
          size="sm"
        />

        <div className="w-px h-5 bg-border" />

        <span className="text-xs text-text-muted font-body">
          {nodes.length} nós
        </span>

        <Button
          variant="primary"
          size="sm"
          icon={<Save size={14} />}
          loading={saving}
          onClick={handleSave}
        >
          Salvar
        </Button>
      </div>

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        <NodePalette onAddNode={onAddNode} />

        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNode(null)}
          onDrop={onDrop}
          onDragOver={onDragOver}
        />

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={onNodeDataUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  )
}
