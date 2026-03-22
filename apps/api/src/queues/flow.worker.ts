import { Worker, Queue, QueueEvents } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import { FlowEngine } from '../modules/flows/flow.engine'
import { BaileysManager } from '../modules/whatsapp/baileys.manager'
import { Redis } from 'ioredis'

const QUEUE_NAME = 'flow-executions'

export function createFlowQueue(redis: Redis) {
  return new Queue(QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 500,
    },
  })
}

export function startFlowWorker(
  redis: Redis,
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
      connection: redis,
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
