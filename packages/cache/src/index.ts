import Redis from 'ioredis'

export type { Redis }

export function createCache(url: string): Redis {
    return new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 })
}

// ─── NAMESPACES ───────────────────────────────────────────────────────────────

export const CacheKeys = {
    // Sessions JWT
    session:      (jti: string) => `session:${jti}`,
    jwtBlacklist: (jti: string) => `jwt_blacklist:${jti}`,

    // Catalog public listing
    contentListing: (hash: string) => `content:listing:${hash}`,

    // Payout job lock
    payoutJobLock: () => 'lock:payout_job',
} as const

export const CacheTTL = {
    session:        7200,   // 2h (access token TTL)
    contentListing: 60,     // 60s
    payoutJobLock:  50,     // 50s
} as const

// ─── JWT BLACKLIST ────────────────────────────────────────────────────────────

export async function blacklistToken(redis: Redis, jti: string, expiresAt: Date): Promise<void> {
    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    if (ttl <= 0) return
    await redis.set(CacheKeys.jwtBlacklist(jti), '1', 'EX', ttl)
}

export async function isTokenBlacklisted(redis: Redis, jti: string): Promise<boolean> {
    return (await redis.get(CacheKeys.jwtBlacklist(jti))) === '1'
}

// ─── CONTENT LISTING ─────────────────────────────────────────────────────────

export async function setContentListing(redis: Redis, hash: string, data: unknown): Promise<void> {
    await redis.set(CacheKeys.contentListing(hash), JSON.stringify(data), 'EX', CacheTTL.contentListing)
}

export async function getContentListing<T>(redis: Redis, hash: string): Promise<T | null> {
    const raw = await redis.get(CacheKeys.contentListing(hash))
    return raw ? (JSON.parse(raw) as T) : null
}

export async function invalidateContentListings(redis: Redis): Promise<void> {
    const keys = await redis.keys('content:listing:*')
    if (keys.length > 0) await redis.del(...keys)
}

// ─── REDIS LIFECYCLE ─────────────────────────────────────────────────────────

let redisInstance: Redis | null = null

export async function initRedis(url?: string): Promise<Redis> {
    if (redisInstance) return redisInstance
    const redisUrl = url ?? process.env.REDIS_URL ?? 'redis://127.0.0.1:6379'
    redisInstance = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        reconnectOnError: () => true,
    })
    redisInstance.on('error', (err) => console.error({ err }, 'Redis error'))
    return redisInstance
}

export async function closeRedis(): Promise<void> {
    if (!redisInstance) return
    await redisInstance.quit()
    redisInstance = null
}
