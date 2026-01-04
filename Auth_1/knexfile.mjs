// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import config from "./envConfig.mjs";


const knexConfig = {

  development: {
    client: 'postgresql',
    connection: {
      database:config.DB.name,
      user:config.DB.user,
      password:config.DB.pass,
      port:config.DB.port,
      host:config.DB.host
    },
    pool:{
      min:2,
      max:10
    },
    migrations:{
      directory:"./src/infra/db/migrations"
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

export default knexConfig;
