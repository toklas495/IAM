import type { FastifyInstance } from 'fastify/types/instance.js';
import { Redis } from 'ioredis';
import { envConfig } from '../../config/index.js';
import { serviceRegistration, versionRegistration ,jwtSecretRotater} from './service.js';

let redis: Redis; // Change from RedisClient to Redis

const connectRedis = (fastify: FastifyInstance, options?: any): Redis => {
    if (redis) return redis;
    
    const redisOptions = {
        host: envConfig.redis.host,
        port: envConfig.redis.port,
        password: envConfig.redis.pass,
        keyPrefix: options?.keyPrefix || "",
        // Additional recommended options
        retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
    };
    
    redis = new Redis(redisOptions);
    
    redis.on("connect", () => {
        fastify.log.info("Redis connected successfully");
    });
    
    redis.on("ready", async() => {
        serviceRegistration();
        await versionRegistration(redis);
        (jwtSecretRotater())();
        fastify.log.info("Redis is ready to accept commands");
    });
    
    redis.on("error", (err) => {
        fastify.log.error(`REDIS-ERROR: ${err.message}`); // Fixed syntax error here
        // Don't exit immediately on error, let retry strategy handle it
        // Only exit on critical errors if needed
    });
    
    redis.on("close", () => {
        fastify.log.warn("Redis connection closed");
    });
    
    redis.on("reconnecting", () => {
        fastify.log.info("Redis reconnecting...");
    });
    
    fastify.addHook("onClose", async () => {
        await redis.quit(); // Use quit() instead of disconnect() for graceful shutdown
        fastify.log.info("Redis connection closed gracefully");
    });
    

    fastify.decorate("redis",redis);
    
    return redis;
};

export { connectRedis, redis };