import { default as dotenv } from 'dotenv';

dotenv.config({ quiet: true });

const config = {
    HOST: process.env.HOST || "0.0.0.0",
    PORT: process.env.PORT || 3000,
    DB: {
        name: process.env.DB_NAME || "tempdb",
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || "postgres",
        pass: process.env.DB_PASS || "postgres",
        host: process.env.DB_HOST || "0.0.0.0"
    },
    REDIS: {
        host: process.env.REDIS_HOST || "0.0.0.0",
        port: process.env.REDIS_PORT || 6378,
        pass: process.env.REDIS_PASS || "mypassword"
    },
    JWT: {
        secret: {
            SHA256_SECRET: process.env.SHA256_SECRET || "secret"
        }
    },
    EMAIL: {
        gmail: {
            pass:process.env.GMAIL_CLIENT_SECRET,
            user:process.env.GMAIL_CLIENT

        }
    },
    OAUTH:{
        google:{
            auth_url:process.env.GOOGLE_AUTH_URI,
            id:process.env.GOOGLE_CLIENT_ID,
            secret:process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri:process.env.GOOGLE_REDIRECT_URI,
            oauth_token:process.env.GOOGLE_OAUTH_TOKEN,
            get_user_url:process.env.GOOGLE_USER_URI,
            jwks_uri:process.env.GOOGLE_JWKS_URI
        },
        github:{
            auth_url:process.env.GITHUB_AUTH_URI,
            id:process.env.GITHUB_CLIENT_ID,
            secret:process.env.GITHUB_CLIENT_SECRET,
            oauth_token:process.env.GITHUB_OAUTH_TOKEN,
            get_user_url:process.env.GITHUB_USER_URI,
            redirect_uri:process.env.GITHUB_REDIRECT_URI
        }
    },
    LOG:{
        level:process.env.LOG_LEVEL
    }
}

export default config;