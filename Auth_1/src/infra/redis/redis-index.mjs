import Redis from 'ioredis';
import redisConfig from '../../config/redisConfig.mjs';

let redis = null;

export async function initRedis(services=[],namespace="404-auth"){
    if(redis) return redis;
    redis = new Redis(redisConfig);

    await new Promise((resolve,reject)=>{
        redis.once("ready",resolve);
        redis.once("error",reject);
    })

    if(services.length){
        for(let service of services){
            const key = `${namespace}-${service}-version`;
            if(!await redis.get(key)){
                await redis.set(key,"1");
            }
        }
    }
    console.log("REDIS CONNECTED...");
    return redis;
}


export async function closeRedis(){
    if(redis) await redis.quit();
    console.log(`Redis connection closed...`);
}
