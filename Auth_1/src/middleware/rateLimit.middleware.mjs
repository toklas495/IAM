import { rateLimit ,ipKeyGenerator} from 'express-rate-limit';

function CreateRateLimit(){
  const RateLimit = {};

  const baseOptions = {
    windowMs: 15 * 60 * 1000,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    statusCode: 429,
    // store: new RedisStore({
    //   sendCommand: (...args) => redis.call(...args)
    // }),
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later."
        }
      });
    }
  };


  RateLimit.NormalLimit = rateLimit({
    ...baseOptions,
    limit: 300
  });

  RateLimit.MediumLimit = rateLimit({
    ...baseOptions,
    limit: 100
  });

  RateLimit.HighLimit = rateLimit({
    ...baseOptions,
    limit: 10,
    keyGenerator: (req) =>
      `${ipKeyGenerator(req)}:anonymous`
  });

  return RateLimit;
}


export default CreateRateLimit;