import { Worker, Queue } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import { FlowEngine } from '../modules/flows/flow.engine'
import { BaileysManager } from '../modules/whatsapp/baileys.manager'

const QUEUE_NAME = 'flow-executions'

// Use URL-based connection to avoid ioredis version conflicts with BullMQ's bundled ioredis
function getConnection(redisUrl: string) {
  return { url: redisUrl }
}

export function createFlowQueue(redisUrl: string) {
  return new Queue(QUEUE_NAME, {
    connection: getConnection(redisUrl),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 500,
    },
  })
}

export function startFlowWorker(
  redisUrl: string,
  prisma: PrismaClient,
  manager: BaileysManager
): Worker {
  const engine = new FlowEngine(prisma, manager)

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { flowId, contactId, instanceId, triggerData } = job.data

      try {
        await engine.execute(flowId, contactId, instanceId, triggerData)
      } catch (err) {
        console.error(`Flow worker error [job ${job.id}]:`, err)
        throw err
      }
    },
    {
      connection: getConnection(redisUrl),
      concurrency: 10,
    }
  )

  worker.on('completed', (job) => {
    console.log(`Flow job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`Flow job ${job?.id} failed:`, err.message)
  })

  worker.on('error', (err) => {
    console.error('Flow worker error:', err)
  })

  return worker
}

export { QUEUE_NAME }
