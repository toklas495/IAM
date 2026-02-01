import knex,{type  Knex} from "knex";
import config from '../../../knexfile';
import { envConfig } from "../../config/index.js";
import type { FastifyInstance } from "fastify/types/instance.js";

const env = envConfig.node_env==="prod"?"production":"development"
const knexConfig:Knex.Config = config[env];

export const db = knex(knexConfig);

export const connectDb = async(fastify:FastifyInstance)=>{
    try{
        await db.raw("select 1");
        fastify.log.info("Db Connected Successfully!");
        
        fastify.addHook("onClose",async()=>{
            await db.destroy();
            fastify.log.info("Db Disconnected Successfully!");
        })
    } catch(error){
        fastify.log.error(`KNEX-${config.client}-ERROR: ${error}`);
        process.exit(1);
    }
}

