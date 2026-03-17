const Redis = require('ioredis');

let client = null;

let redisAvailable = true;

function getRedis() {
  if (!client) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    const isTLS = url.startsWith('rediss://');
    client = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      commandTimeout: 5000,
      lazyConnect: true,
      tls: isTLS ? {} : undefined,
      retryStrategy: (times) => {
        if (times > 2) {
          redisAvailable = false;
          return null;
        }
        return Math.min(times * 200, 1000);
      },
    });
    client.on('error', (err) => {
      redisAvailable = false;
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[Redis] unavailable, running without cache:', err.message);
      }
    });
    client.on('connect', () => {
      redisAvailable = true;
    });
  }
  return client;
}

const CACHE_TTL = {
  DASHBOARD: 30,    // 30 seconds — near-realtime stats
  SESSION: 604800,  // 7 days
};

async function cacheGet(key) {
  if (!redisAvailable) return null;
  try {
    const val = await getRedis().get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 60) {
  if (!redisAvailable) return;
  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // silent — cache miss is acceptable
  }
}

async function cacheDel(key) {
  if (!redisAvailable) return;
  try {
    await getRedis().del(key);
  } catch {}
}

async function cacheDelPattern(pattern) {
  if (!redisAvailable) return;
  try {
    const keys = await getRedis().keys(pattern);
    if (keys.length > 0) await getRedis().del(...keys);
  } catch {}
}

module.exports = { getRedis, cacheGet, cacheSet, cacheDel, cacheDelPattern, CACHE_TTL };
