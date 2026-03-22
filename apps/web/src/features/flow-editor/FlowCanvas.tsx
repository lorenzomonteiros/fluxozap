import React, { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { TriggerNode } from './nodes/TriggerNode'
import { TextMessageNode } from './nodes/TextMessageNode'
import { ImageNode } from './nodes/ImageNode'
import { AudioNode } from './nodes/AudioNode'
import { VideoNode } from './nodes/VideoNode'
import { DocumentNode } from './nodes/DocumentNode'
import { DelayNode } from './nodes/DelayNode'
import { ConditionNode } from './nodes/ConditionNode'
import { TagActionNode } from './nodes/TagActionNode'
import { SaveVariableNode } from './nodes/SaveVariableNode'
import { WebhookNode } from './nodes/WebhookNode'
import { EndNode } from './nodes/EndNode'

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  text_message: TextMessageNode,
  image: ImageNode,
  audio: AudioNode,
  video: VideoNode,
  document: DocumentNode,
  delay: DelayNode,
  condition: ConditionNode,
  tag_action: TagActionNode,
  save_variable: SaveVariableNode,
  webhook: WebhookNode,
  end: EndNode,
}

interface FlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onNodeClick: (node: Node) => void
  onPaneClick: () => void
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onDrop,
  onDragOver,
}) => {
  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => {
      onNodeClick(node)
    },
    [onNodeClick]
  )

  return (
    <div className="flex-1 h-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 2, stroke: 'rgba(212, 175, 55, 0.5)' },
          animated: false,
        }}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.05)"
        />
        <Controls />
        <MiniMap
          nodeColor={() => '#D4AF37'}
          maskColor="rgba(10, 10, 10, 0.7)"
        />
      </ReactFlow>
    </div>
  )
}
