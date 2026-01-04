import pino from 'pino';
import config from '../../../envConfig.mjs';

export const logger = pino({
    level:config.LOG.level||"info",

    // NEVER leak secret (auth-service rule)
    redact:{
        paths:[
            "req.headers.authorization",
            "req.headers.cookie",
            "*.password",
            "*.token",
            "*.otp"
        ],
        censor:"[REDACTED]",
    },

    // global identity of the service
    base:{
        service:"404-auth",
        env:process.env.NODE_ENV||"development",
    },

    timestamp:pino.stdTimeFunctions.isoTime,

    serializers:{
        err:pino.stdSerializers.err,
        req:pino.stdSerializers.req,
        res:pino.stdSerializers.res
    }
});

