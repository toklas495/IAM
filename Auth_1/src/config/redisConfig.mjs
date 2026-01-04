import envconfig from '../../envConfig.mjs';

const config = {
    host:envconfig.REDIS.host,
    port:envconfig.REDIS.port,
    password:envconfig.REDIS.pass,
    keyPrefix:envconfig.REDIS?.keyPrefix||"",
    maxRetriesPerRequest:null,
    enableReadyCheck:false
}

export default config;