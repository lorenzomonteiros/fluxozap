"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowEngine = void 0;
const axios_1 = __importDefault(require("axios"));
class FlowEngine {
    prisma;
    manager;
    constructor(prisma, manager) {
        this.prisma = prisma;
        this.manager = manager;
    }
    async execute(flowId, contactId, instanceId, triggerData) {
        const flow = await this.prisma.flow.findUnique({ where: { id: flowId } });
        if (!flow || !flow.isActive)
            return;
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
        if (!contact || contact.optOut)
            return;
        const execution = await this.prisma.flowExecution.create({
            data: { flowId, contactId, status: 'running' },
        });
        const context = {
            contactId,
            instanceId,
            variables: {
                ...(contact.variables ?? {}),
                contact_name: contact.name ?? '',
                contact_phone: contact.phone,
                trigger_text: triggerData.text ?? '',
            },
            triggerData,
        };
        const nodes = flow.nodes;
        const edges = flow.edges;
        try {
            const triggerNode = nodes.find((n) => n.type === 'trigger');
            if (!triggerNode) {
                await this.completeExecution(execution.id, 'failed');
                return;
            }
            await this.executeFromNode(triggerNode.id, nodes, edges, context, execution.id);
            await this.completeExecution(execution.id, 'completed');
        }
        catch (error) {
            console.error(`Flow execution error [${execution.id}]:`, error);
            await this.completeExecution(execution.id, 'failed');
        }
    }
    async executeFromNode(nodeId, nodes, edges, context, executionId, maxSteps = 100) {
        let currentNodeId = nodeId;
        let steps = 0;
        while (currentNodeId && steps < maxSteps) {
            steps++;
            const node = nodes.find((n) => n.id === currentNodeId);
            if (!node)
                break;
            await this.prisma.flowExecution.update({
                where: { id: executionId },
                data: { currentNode: currentNodeId },
            });
            const nextNodeId = await this.executeNode(node, edges, context, nodes, executionId);
            currentNodeId = nextNodeId;
        }
    }
    async executeNode(node, edges, context, allNodes, executionId) {
        const { type, data } = node;
        switch (type) {
            case 'trigger': {
                return this.getNextNode(node.id, edges);
            }
            case 'text_message': {
                const message = this.interpolate(data.message, context.variables);
                await this.manager.sendTextMessage(context.instanceId, context.triggerData.phone, message);
                await this.saveOutboundMessage(context, 'text', { text: message });
                return this.getNextNode(node.id, edges);
            }
            case 'image': {
                await this.manager.sendMediaMessage(context.instanceId, context.triggerData.phone, 'image', data.url, { caption: data.caption });
                await this.saveOutboundMessage(context, 'image', { url: data.url, caption: data.caption });
                return this.getNextNode(node.id, edges);
            }
            case 'audio': {
                await this.manager.sendMediaMessage(context.instanceId, context.triggerData.phone, 'audio', data.url);
                await this.saveOutboundMessage(context, 'audio', { url: data.url });
                return this.getNextNode(node.id, edges);
            }
            case 'video': {
                await this.manager.sendMediaMessage(context.instanceId, context.triggerData.phone, 'video', data.url, { caption: data.caption });
                await this.saveOutboundMessage(context, 'video', { url: data.url, caption: data.caption });
                return this.getNextNode(node.id, edges);
            }
            case 'document': {
                await this.manager.sendMediaMessage(context.instanceId, context.triggerData.phone, 'document', data.url, { caption: data.caption, filename: data.filename });
                await this.saveOutboundMessage(context, 'document', { url: data.url, filename: data.filename });
                return this.getNextNode(node.id, edges);
            }
            case 'delay': {
                const duration = data.duration;
                const unit = data.unit;
                const ms = {
                    seconds: duration * 1000,
                    minutes: duration * 60 * 1000,
                    hours: duration * 3600 * 1000,
                }[unit];
                await new Promise((resolve) => setTimeout(resolve, ms));
                return this.getNextNode(node.id, edges);
            }
            case 'condition': {
                const variable = data.variable;
                const operator = data.operator;
                const value = data.value;
                const varValue = context.variables[variable] ?? '';
                const result = this.evaluateCondition(varValue, operator, value);
                const handle = result ? 'true' : 'false';
                return this.getNextNodeByHandle(node.id, handle, edges);
            }
            case 'tag_action': {
                const action = data.action;
                const tag = data.tag;
                const contact = await this.prisma.contact.findUnique({ where: { id: context.contactId } });
                if (contact) {
                    const tags = contact.tags;
                    const newTags = action === 'add'
                        ? Array.from(new Set([...tags, tag]))
                        : tags.filter((t) => t !== tag);
                    await this.prisma.contact.update({
                        where: { id: context.contactId },
                        data: { tags: newTags },
                    });
                }
                return this.getNextNode(node.id, edges);
            }
            case 'save_variable': {
                const variableName = data.variableName;
                const source = data.source;
                let varValue = '';
                if (source === 'static') {
                    varValue = data.value ?? '';
                }
                else if (source === 'last_message') {
                    varValue = context.triggerData.text ?? '';
                }
                else if (source === 'expression') {
                    varValue = this.interpolate(data.value ?? '', context.variables);
                }
                context.variables[variableName] = varValue;
                const currentContact = await this.prisma.contact.findUnique({ where: { id: context.contactId } });
                const currentVars = currentContact?.variables ?? {};
                await this.prisma.contact.update({
                    where: { id: context.contactId },
                    data: {
                        variables: { ...currentVars, [variableName]: varValue },
                    },
                });
                return this.getNextNode(node.id, edges);
            }
            case 'webhook': {
                try {
                    const url = this.interpolate(data.url, context.variables);
                    const method = (data.method ?? 'POST').toLowerCase();
                    const headers = data.headers ?? {};
                    const bodyTemplate = data.body ?? '';
                    const body = bodyTemplate ? JSON.parse(this.interpolate(bodyTemplate, context.variables)) : undefined;
                    const response = await (0, axios_1.default)({ method, url, headers, data: body });
                    if (data.saveResponseAs) {
                        context.variables[data.saveResponseAs] = JSON.stringify(response.data);
                    }
                }
                catch (err) {
                    console.error('Webhook node error:', err);
                }
                return this.getNextNode(node.id, edges);
            }
            case 'end': {
                return null;
            }
            default: {
                return this.getNextNode(node.id, edges);
            }
        }
    }
    getNextNode(sourceId, edges) {
        const edge = edges.find((e) => e.source === sourceId && (!e.sourceHandle || e.sourceHandle === 'default'));
        return edge?.target ?? null;
    }
    getNextNodeByHandle(sourceId, handle, edges) {
        const edge = edges.find((e) => e.source === sourceId && e.sourceHandle === handle);
        if (edge)
            return edge.target;
        return this.getNextNode(sourceId, edges);
    }
    evaluateCondition(value, operator, compareValue) {
        const cv = compareValue ?? '';
        switch (operator) {
            case 'equals': return value === cv;
            case 'not_equals': return value !== cv;
            case 'contains': return value.includes(cv);
            case 'not_contains': return !value.includes(cv);
            case 'starts_with': return value.startsWith(cv);
            case 'ends_with': return value.endsWith(cv);
            case 'exists': return value !== '' && value !== undefined;
            case 'not_exists': return value === '' || value === undefined;
            default: return false;
        }
    }
    interpolate(template, variables) {
        return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
    }
    async saveOutboundMessage(context, type, content) {
        await this.prisma.message.create({
            data: {
                instanceId: context.instanceId,
                contactId: context.contactId,
                direction: 'outbound',
                type,
                content: content,
                status: 'sent',
                sentAt: new Date(),
            },
        });
    }
    async completeExecution(executionId, status) {
        await this.prisma.flowExecution.update({
            where: { id: executionId },
            data: { status, completedAt: new Date() },
        });
    }
}
exports.FlowEngine = FlowEngine;
