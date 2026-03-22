import React from 'react'
import { Node } from '@xyflow/react'
import { X } from 'lucide-react'
import { Input, Textarea } from '../../components/ui/Input'
import { Select } from '../../components/ui/Dropdown'
import { Button } from '../../components/ui/Button'

interface NodeConfigPanelProps {
  node: Node | null
  onUpdate: (nodeId: string, data: Record<string, unknown>) => void
  onClose: () => void
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onUpdate, onClose }) => {
  if (!node) return null

  const data = node.data as Record<string, unknown>

  const update = (key: string, value: unknown) => {
    onUpdate(node.id, { ...data, [key]: value })
  }

  const renderConfig = () => {
    switch (node.type) {
      case 'trigger':
        return (
          <div className="space-y-4">
            <Select
              label="Tipo de gatilho"
              value={data.triggerType as string ?? 'keyword'}
              onChange={(v) => update('triggerType', v)}
              options={[
                { value: 'keyword', label: 'Palavra-chave' },
                { value: 'any_message', label: 'Qualquer mensagem' },
                { value: 'first_message', label: 'Primeira mensagem' },
                { value: 'button_reply', label: 'Resposta de botão' },
                { value: 'list_reply', label: 'Resposta de lista' },
              ]}
            />
            {data.triggerType === 'keyword' && (
              <Input
                label="Palavra-chave"
                placeholder="Ex: oi, olá, start"
                value={data.triggerValue as string ?? ''}
                onChange={(e) => update('triggerValue', e.target.value)}
                fullWidth
                hint="A mensagem deve conter esta palavra"
              />
            )}
          </div>
        )

      case 'text_message':
        return (
          <div className="space-y-4">
            <Textarea
              label="Mensagem"
              placeholder="Olá {{contact_name}}! Como posso ajudar?"
              value={data.message as string ?? ''}
              onChange={(e) => update('message', e.target.value)}
              fullWidth
              hint="Use {{variavel}} para inserir variáveis"
            />
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <Input
              label="URL da imagem"
              placeholder="https://..."
              value={data.url as string ?? ''}
              onChange={(e) => update('url', e.target.value)}
              fullWidth
            />
            <Input
              label="Legenda (opcional)"
              placeholder="Descrição da imagem..."
              value={data.caption as string ?? ''}
              onChange={(e) => update('caption', e.target.value)}
              fullWidth
            />
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-4">
            <Input
              label="URL do áudio"
              placeholder="https://..."
              value={data.url as string ?? ''}
              onChange={(e) => update('url', e.target.value)}
              fullWidth
            />
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <Input
              label="URL do vídeo"
              placeholder="https://..."
              value={data.url as string ?? ''}
              onChange={(e) => update('url', e.target.value)}
              fullWidth
            />
            <Input
              label="Legenda (opcional)"
              placeholder="..."
              value={data.caption as string ?? ''}
              onChange={(e) => update('caption', e.target.value)}
              fullWidth
            />
          </div>
        )

      case 'document':
        return (
          <div className="space-y-4">
            <Input
              label="URL do documento"
              placeholder="https://..."
              value={data.url as string ?? ''}
              onChange={(e) => update('url', e.target.value)}
              fullWidth
            />
            <Input
              label="Nome do arquivo"
              placeholder="documento.pdf"
              value={data.filename as string ?? ''}
              onChange={(e) => update('filename', e.target.value)}
              fullWidth
            />
            <Input
              label="Legenda (opcional)"
              placeholder="..."
              value={data.caption as string ?? ''}
              onChange={(e) => update('caption', e.target.value)}
              fullWidth
            />
          </div>
        )

      case 'delay':
        return (
          <div className="space-y-4">
            <Input
              label="Duração"
              type="number"
              min={1}
              value={String(data.duration ?? 5)}
              onChange={(e) => update('duration', parseInt(e.target.value))}
              fullWidth
            />
            <Select
              label="Unidade"
              value={data.unit as string ?? 'seconds'}
              onChange={(v) => update('unit', v)}
              options={[
                { value: 'seconds', label: 'Segundos' },
                { value: 'minutes', label: 'Minutos' },
                { value: 'hours', label: 'Horas' },
              ]}
            />
          </div>
        )

      case 'condition':
        return (
          <div className="space-y-4">
            <Input
              label="Nome da variável"
              placeholder="contact_name"
              value={data.variable as string ?? ''}
              onChange={(e) => update('variable', e.target.value)}
              fullWidth
            />
            <Select
              label="Operador"
              value={data.operator as string ?? 'equals'}
              onChange={(v) => update('operator', v)}
              options={[
                { value: 'equals', label: 'Igual a' },
                { value: 'not_equals', label: 'Diferente de' },
                { value: 'contains', label: 'Contém' },
                { value: 'not_contains', label: 'Não contém' },
                { value: 'starts_with', label: 'Começa com' },
                { value: 'ends_with', label: 'Termina com' },
                { value: 'exists', label: 'Existe' },
                { value: 'not_exists', label: 'Não existe' },
              ]}
            />
            {!['exists', 'not_exists'].includes(data.operator as string ?? 'equals') && (
              <Input
                label="Valor para comparar"
                placeholder="valor"
                value={data.value as string ?? ''}
                onChange={(e) => update('value', e.target.value)}
                fullWidth
              />
            )}
          </div>
        )

      case 'tag_action':
        return (
          <div className="space-y-4">
            <Select
              label="Ação"
              value={data.action as string ?? 'add'}
              onChange={(v) => update('action', v)}
              options={[
                { value: 'add', label: 'Adicionar tag' },
                { value: 'remove', label: 'Remover tag' },
              ]}
            />
            <Input
              label="Nome da tag"
              placeholder="cliente, vip, prospecto..."
              value={data.tag as string ?? ''}
              onChange={(e) => update('tag', e.target.value)}
              fullWidth
            />
          </div>
        )

      case 'save_variable':
        return (
          <div className="space-y-4">
            <Input
              label="Nome da variável"
              placeholder="minha_variavel"
              value={data.variableName as string ?? ''}
              onChange={(e) => update('variableName', e.target.value)}
              fullWidth
              hint="Use apenas letras, números e _"
            />
            <Select
              label="Fonte do valor"
              value={data.source as string ?? 'static'}
              onChange={(v) => update('source', v)}
              options={[
                { value: 'last_message', label: 'Última mensagem recebida' },
                { value: 'static', label: 'Valor fixo' },
                { value: 'expression', label: 'Expressão {{variavel}}' },
              ]}
            />
            {data.source !== 'last_message' && (
              <Input
                label="Valor"
                placeholder={data.source === 'expression' ? '{{contact_name}}' : 'Valor fixo'}
                value={data.value as string ?? ''}
                onChange={(e) => update('value', e.target.value)}
                fullWidth
              />
            )}
          </div>
        )

      case 'webhook':
        return (
          <div className="space-y-4">
            <Select
              label="Método HTTP"
              value={data.method as string ?? 'POST'}
              onChange={(v) => update('method', v)}
              options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'PATCH', label: 'PATCH' },
                { value: 'DELETE', label: 'DELETE' },
              ]}
            />
            <Input
              label="URL"
              placeholder="https://api.exemplo.com/webhook"
              value={data.url as string ?? ''}
              onChange={(e) => update('url', e.target.value)}
              fullWidth
            />
            <Textarea
              label="Body (JSON, opcional)"
              placeholder='{"contato": "{{contact_phone}}"}'
              value={data.body as string ?? ''}
              onChange={(e) => update('body', e.target.value)}
              fullWidth
            />
            <Input
              label="Salvar resposta como variável"
              placeholder="webhook_response"
              value={data.saveResponseAs as string ?? ''}
              onChange={(e) => update('saveResponseAs', e.target.value)}
              fullWidth
            />
          </div>
        )

      case 'end':
        return (
          <div className="text-center py-4">
            <p className="text-sm text-text-secondary font-body">
              Este nó encerra o fluxo de automação.
            </p>
          </div>
        )

      default:
        return (
          <p className="text-sm text-text-secondary">Configuração não disponível para este nó.</p>
        )
    }
  }

  const typeLabels: Record<string, string> = {
    trigger: 'Gatilho',
    text_message: 'Mensagem de Texto',
    image: 'Imagem',
    audio: 'Áudio',
    video: 'Vídeo',
    document: 'Documento',
    delay: 'Aguardar',
    condition: 'Condição',
    tag_action: 'Ação de Tag',
    save_variable: 'Salvar Variável',
    webhook: 'Webhook',
    end: 'Fim',
  }

  return (
    <div className="w-72 bg-background-card border-l border-border flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary font-body">
          {typeLabels[node.type ?? ''] ?? 'Configurar'}
        </h3>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderConfig()}
      </div>
    </div>
  )
}
