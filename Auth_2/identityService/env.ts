import "dotenv/config";
import {z} from 'zod';


const EnvSchema = z.object({
    NODE_ENV:z.enum(["dev","prod","test"]).default("dev"),
    PORT:z.coerce.number().int().positive().default(3000),
    HOST:z.string().default("0.0.0.0"),
    MONGO_DB_URI:z.string().url(),
    POSTGRES_HOST:z.string().default("0.0.0.0"),
    POSTGRES_PORT:z.coerce.number().int().positive().default(5432),
    POSTGRES_USER:z.string().default("postgres"),
    POSTGRES_PASS:z.string().default("postgres"),
    POSTGRES_DB:z.string().default("mydb"),
    REDIS_HOST:z.string().default("0.0.0.0"),
    REDIS_PORT:z.coerce.number().int().positive().default(6379),
    REDIS_PASS:z.string().default("mypassword"),
    GOOGLE_CLIENT:z.string(),
    GOOGLE_SECRET:z.string(),
    GOOGLE_OAUTH_URL:z.string(),
    GOOGLE_TOKEN_URL:z.string(),
    GOOGLE_REDIRECT_URL:z.string(),
    GOOGLE_SCOPE:z.string(),
    GOOGLE_JWKS_URI:z.string()
})

// parse and validate
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  process.stderr.write("❌ Invalid environment variables:\n");
  process.stderr.write(
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
  process.stderr.write("\n");
  process.exit(1);
}


export const env = parsed.data;