import type { FastifyInstance } from "fastify/types/instance.js";
import createAuthRoutes from "./auth.routes.js";
import type { RouteDeps } from "./auth.routes.js";

export default function createRoutes(fastify:FastifyInstance,opts:RouteDeps){
    fastify.register(createAuthRoutes,{prefix:"/api/v1/auth",...opts});
}