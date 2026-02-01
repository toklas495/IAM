import Fastify from "fastify";
import cookie from '@fastify/cookie';
import createContainer from "./container.js";
import type { ContainerSchema } from "./container.js";
import createRoutes from "../routes/index.routes.js";

export default function createApp(){
    const fastify = Fastify({
        logger:true,
        bodyLimit:1024*64
    })
    fastify.server.keepAliveTimeout = 7_000;
    fastify.server.keepAliveTimeoutBuffer=1_000;

    // register plugins
    fastify.register(cookie);

    // ping
    fastify.get("/ping",async (req,reply)=>{
        return reply.status(200).send("pong...");
    })

    const options:ContainerSchema = createContainer();
    fastify.register(createRoutes,options);

    
    return fastify;
}