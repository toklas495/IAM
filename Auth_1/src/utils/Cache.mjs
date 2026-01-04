import AppError from "./Error.mjs";

class Cache {
  constructor(redis,service, namespace = "404-auth", ttl = 900) {
    this.redis = redis;        // ✅ no init
    this.namespace = namespace;
    this.service = service;
    this.services = new Set([service]); // ✅ avoid duplicates
    this.ttl = ttl;
  }
  useVersionOf(service) {
    this.services.add(service);
    return this;
  }

  setTtl(ttl=900){
    this.ttl = ttl;
    return this;
  }
  // 🔐 version key is deterministic and correct
  _versionKey(service) {
    return `${this.namespace}:${service}:version`;
  }

  async _buildKey(...keyParams) {
    const services = [...this.services];

    const versionKeys = services.map(s => this._versionKey(s));
    const versionValues = await this.redis.mget(versionKeys);

    const versionPart = services.map((service, i) => {
      const v = versionValues[i] || "1";
      return `${service}-v${v}`;
    });

    return `${this.namespace}:${versionPart.join(":")}:${keyParams.join(":")}`;
  }

  async get(...keyParams) {
    const key = await this._buildKey(...keyParams);
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }



  async set(data, ...keyParams) {
    const key = await this._buildKey(...keyParams);
    await this.redis.set(
      key,
      JSON.stringify(data),
      "EX",
      this.ttl
    );
  }

  async remove(...keyParams) {
    const key = await this._buildKey(...keyParams);
    await this.redis.unlink(key);
  }

  // 🔥 atomic invalidation
  async bumpVersion(service = this.service) {
    await this.redis.incr(this._versionKey(service));
  }
}

const CachedReferences = {};
let intialized = false;
export function initCache(redis,services=[],namespace){
  if(intialized){
    throw AppError.known({
      message:"Cache already intialized!",
      event:"event.utils.cache.initcache",
      layer:"layer.utils",
      status:500,
      code:"INTIALIZED_ERROR"
    })
  }
  if(services.length){
    for(let service of services){
      CachedReferences[service] = new Cache(redis,service,namespace);
    }
  }
  Object.freeze(CachedReferences);
  console.log("Cache Established...");
}

export function getCache(service){
  if(!CachedReferences.hasOwnProperty(service)){
    throw AppError.known({
      message:"service is unknown!",
      event:"event.utils.cache.getCache",
      layer:"layer.utils",
      status:404,
      code:"NOT_FOUND"
    })
  }
  return CachedReferences[service];
}

