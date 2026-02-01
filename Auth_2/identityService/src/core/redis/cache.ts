import { redis } from "./index.js";
import { constantConfig } from "../../config/constant.js";


export class Cache<T=unknown> {
    private ttl = constantConfig.cache.ttl||900;
    private services: string[];
    private primaryService: string;
    private namespace: string;

    constructor(service: string, namespace: string = constantConfig.cache.namespace||"404auth") {
        this.services = [service];
        this.primaryService = service;
        this.namespace = namespace;
    }

    setTtl(ttl: number = 900): this {
        this.ttl = ttl;
        return this;
    }

    useVersionOf(service: string): this {
        if (!this.services.includes(service)) {
            this.services.push(service);
        }
        return this;
    }

    private async buildKey(...keyParams: (string | number)[]): Promise<string> {
        const versionKeys = this.services.map(
            s => `${this.namespace}.${s}.version`
        );

        const versionValues = await redis.mget(versionKeys);

        const versions = this.services.map((s, i) => {
            const v = versionValues[i] ?? "1";
            return `${s}.v${v}`;
        });

        return `${this.namespace}:${versions.join(":")}:${keyParams.join(":")}`;
    }

    async set(
        data: string | number | object,
        ...keyParams: (string | number)[]
    ): Promise<boolean> {
        try {
            const key = await this.buildKey(...keyParams);
            const value =
                typeof data === "object" ? JSON.stringify(data) : String(data);

            if (this.ttl > 0) {
                await redis.setex(key, this.ttl, value);
            } else {
                await redis.set(key, value);
            }

            this.ttl = 900;
            return true;
        } catch (err) {
            console.error("Cache set error:", err);
            return false;
        }
    }

    async get(...keyParams: (string | number)[]): Promise<any | null> {
        try {
            const key = await this.buildKey(...keyParams);
            const value = await redis.get(key);
            if (value == null) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (err) {
            console.error("Cache get error:", err);
            return null;
        }
    }

    async incr(
        amount: number = 1,
        ...keyParams: (string | number)[]
    ): Promise<number | null> {
        try {
            const key = await this.buildKey(...keyParams);
            const result =
                amount === 1
                    ? await redis.incr(key)
                    : await redis.incrby(key, amount);

            if (this.ttl > 0) {
                await redis.expire(key, this.ttl);
            }

            return result;
        } catch (err) {
            console.error("Cache incr error:", err);
            return null;
        }
    }

    async updateInc(service: string = this.primaryService): Promise<void> {
        const key = `${this.namespace}.${service}.version`;
        await redis.incr(key);
    }

    async remove(...keyParams: (string | number)[]): Promise<boolean> {
        try {
            const key = await this.buildKey(...keyParams);
            return (await redis.del(key)) > 0;
        } catch (err) {
            console.error("Cache remove error:", err);
            return false;
        }
    }

    // ⚠ safer alternative than flushdb
    async clearNamespace(): Promise<boolean> {
        try {
            const keys = await redis.keys(`${this.namespace}:*`);
            if (keys.length) await redis.del(keys);
            return true;
        } catch (err) {
            console.error("Cache clear error:", err);
            return false;
        }
    }
}

