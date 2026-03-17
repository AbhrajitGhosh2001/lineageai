const { Queue } = require('bullmq');
const Redis = require('ioredis');

// BullMQ requires maxRetriesPerRequest: null — dedicated connection
function makeBullRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const isTLS = url.startsWith('rediss://');
  return new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: isTLS ? {} : undefined,
  });
}

let outreachQueue = null;

function getOutreachQueue() {
  if (!outreachQueue) {
    try {
      outreachQueue = new Queue('outreach', {
        connection: makeBullRedis(),
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        },
      });
    } catch (err) {
      console.warn('[Queue] BullMQ unavailable, outreach will be synchronous:', err.message);
    }
  }
  return outreachQueue;
}

async function enqueueOutreach(jobData) {
  const queue = getOutreachQueue();
  if (!queue) return null;
  try {
    const job = await queue.add('send-outreach', jobData, {
      delay: jobData.delayMs ?? 0,
    });
    return job.id;
  } catch (err) {
    console.warn('[Queue] Failed to enqueue outreach job:', err.message);
    return null;
  }
}

module.exports = { getOutreachQueue, enqueueOutreach };
