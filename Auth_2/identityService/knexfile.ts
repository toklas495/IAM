import type { Knex } from 'knex'
import { env } from './env.ts';

const config :{[key:string]:Knex.Config} = {
  development: {
    client: 'pg',
    connection: {
      host:env.POSTGRES_HOST,
      user:env.POSTGRES_USER,
      password:env.POSTGRES_PASS,
      port:env.POSTGRES_PORT,
      database:env.POSTGRES_DB
    },
    migrations:{
      directory:"./src/core/db/knex_migrations",
      extension:"ts"
    },
    pool:{
      min:2,
      max:10
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};


export default config;