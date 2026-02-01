import  { Cache } from "./cache.js";

const CacheMap = new Map<string, Cache<any>>();

export const setCache = <T>(
    service: string,
    namespace?: string
): Cache<T> => {
    if (!CacheMap.has(service)) {
        CacheMap.set(service, new Cache<T>(service, namespace));
    }
    return CacheMap.get(service)! as Cache<T>;
};

export const getCache = <T>(
    service:string
):Cache<T>|undefined=>{
    return CacheMap.get(service) as Cache<T>|undefined
}