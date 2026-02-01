import type { FastifyInstance } from "fastify/types/instance.js";
import {registerSchema,loginSchema,OauthInitiateSchema,OauthCallbackSchema, AuthLinkSchema} from "../schema/auth.schema.js";
import type { AuthControllerSchema } from "../controller/auth.controller.js";

export interface RouteDeps{
    Auth:AuthControllerSchema,
}

export default function createAuthRoutes(fastify:FastifyInstance,opts:RouteDeps){
    fastify.post("/register",{schema:registerSchema},opts.Auth.register);
    fastify.post("/login",{schema:loginSchema},opts.Auth.loginWithPassword);
    fastify.get("/oauth",{schema:OauthInitiateSchema},opts.Auth.loginWithOauth);
    fastify.get("/:provider/callback",{schema:OauthCallbackSchema},opts.Auth.callbackOauth);
    fastify.post("/link/:flowId",{schema:AuthLinkSchema},opts.Auth.authLink);
}