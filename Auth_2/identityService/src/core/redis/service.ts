import { Redis } from "ioredis";
import { constantConfig } from "../../config/constant.js";
import { setCache,getCache } from "./cache.registry.js";
import { genES256Key, genRSA256Key, genSHA256Key } from "../../service/tokens/alg.token.js";
import type { JWTAlg,KeyMaterial,KeyStore,StoredKey } from "../../type/cache.type.js";

const services: string[] = constantConfig.cache.services;
const namespace: string = constantConfig.cache.namespace;

export const versionRegistration = async (redis: Redis) => {
    for (let s of services) {
        const version = `${namespace}.${s}.version`;
        if (!await redis.get(version)) {
            await redis.set(version, "1")
        }
    }
}

export const serviceRegistration = () => {
    for (let s of services) {
        setCache(s, namespace);
    }
}


export const jwtSecretRotater = (alg: JWTAlg = "HS256") => {
  let isRun = false;
  let rotating = false;

  const secretCache = getCache<KeyStore>("secret");
  if (!secretCache) {
    throw new Error("[auth] Secret cache not registered");
  }

  const rotater = async (): Promise<void> => {
    let store = await secretCache.get("jwt-keys");

    if (!store) {
      store = { active: null, keys: {} };
    }

    const kid = `key-${Date.now()}`;

    let keyMaterial: KeyMaterial;
    switch (alg) {
      case "HS256":
        keyMaterial = genSHA256Key();
        break;
      case "ES256":
        keyMaterial = genES256Key();
        break;
      case "RS256":
        keyMaterial = genRSA256Key();
        break;
      default: {
        const _never: never = alg;
        throw new Error(`Unsupported alg: ${_never}`);
      }
    }

    // demote previous active key
    if (store.active && store.keys[store.active]) {
      store.keys[store.active].status = "PASSIVE";
    }

    // insert new active key
    store.keys[kid] = {
      alg,
      status: "ACTIVE",
      created_at: Date.now(),
      ...keyMaterial
    };

    store.active = kid;

    // retain only latest 3 keys
    const sorted = Object.entries(store.keys)
      .sort((a, b) => a[1].created_at - b[1].created_at);

    while (sorted.length > 3) {
      const [oldKid] = sorted.shift()!;
      delete store.keys[oldKid];
    }

    // 7 days TTL
    await secretCache
      .setTtl(60 * 60 * 24 * 7)
      .set(store, "jwt-keys");
  };

  return async function scheduler() {
    if (isRun) return;
    isRun = true;

    const safeRotate = async () => {
      if (rotating) return;
      rotating = true;

      try {
        await rotater();
        console.log("[auth] JWT secret rotated");
      } catch (err) {
        console.error("[auth] JWT rotation failed", err);
      } finally {
        rotating = false;
      }
    };

    // initial rotation
    setTimeout(safeRotate, 10_000);

    // daily rotation
    setInterval(safeRotate, 86_400_000);
  };
};
