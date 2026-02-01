import {env} from "../../env";

export const envConfig = {
    node_env:env.NODE_ENV,
    server:{
        host:env.HOST,
        port:env.PORT
    },
    db:{
        mongo:{
            url:env.MONGO_DB_URI
        },
        postgres:{
            host:env.POSTGRES_HOST,
            pass:env.POSTGRES_PASS,
            user:env.POSTGRES_USER,
            port:env.POSTGRES_PORT,
            name:env.POSTGRES_DB
        }
    },
    redis:{
        host:env.REDIS_HOST,
        port:env.REDIS_PORT,
        pass:env.REDIS_PASS
    },
    oauth:{
        google:{
            client:env.GOOGLE_CLIENT,
            secret:env.GOOGLE_SECRET,
            oauth_url:env.GOOGLE_OAUTH_URL,
            token_url:env.GOOGLE_TOKEN_URL,
            redirect_url:env.GOOGLE_REDIRECT_URL,
            scope:env.GOOGLE_SCOPE,
            jwks_uri:env.GOOGLE_JWKS_URI||"https://www.googleapis.com/oauth2/v3/certs"
        }
    }
}

