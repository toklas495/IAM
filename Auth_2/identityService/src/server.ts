import type { FastifyInstance } from "fastify/types/instance.js";
import { envConfig } from "./config/index.js";

export default async function createServer(server:FastifyInstance):Promise<void>{
    const {host,port} = envConfig.server;
    try{
        await server.listen({host,port});
    }catch(error){
        server.log.fatal({err:error},"x Failed to start server.");
        // ensure logs are flushed before exit
        server.close().finally(()=>{
            process.exit(1);
        })

        //typescript saftey
        throw error;
    }
}
