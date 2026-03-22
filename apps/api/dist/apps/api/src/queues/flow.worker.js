"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_NAME = void 0;
exports.createFlowQueue = createFlowQueue;
exports.startFlowWorker = startFlowWorker;
const bullmq_1 = require("bullmq");
const flow_engine_1 = require("../modules/flows/flow.engine");
const QUEUE_NAME = 'flow-executions';
exports.QUEUE_NAME = QUEUE_NAME;
// Use URL-based connection to avoid ioredis version conflicts with BullMQ's bundled ioredis
function getConnection(redisUrl) {
    return { url: redisUrl };
}
function createFlowQueue(redisUrl) {
    return new bullmq_1.Queue(QUEUE_NAME, {
        connection: getConnection(redisUrl),
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 1000,
            removeOnFail: 500,
        },
    });
}
function startFlowWorker(redisUrl, prisma, manager) {
    const engine = new flow_engine_1.FlowEngine(prisma, manager);
    const worker = new bullmq_1.Worker(QUEUE_NAME, async (job) => {
        const { flowId, contactId, instanceId, triggerData } = job.data;
        try {
            await engine.execute(flowId, contactId, instanceId, triggerData);
        }
        catch (err) {
            console.error(`Flow worker error [job ${job.id}]:`, err);
            throw err;
        }
    }, {
        connection: getConnection(redisUrl),
        concurrency: 10,
    });
    worker.on('completed', (job) => {
        console.log(`Flow job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
        console.error(`Flow job ${job?.id} failed:`, err.message);
    });
    worker.on('error', (err) => {
        console.error('Flow worker error:', err);
    });
    return worker;
}
