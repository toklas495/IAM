import type { FastifyRequest } from "fastify/types/request.js"
import type { AuthServiceSchema } from "../service/auth/auth.service.js"
import type { ErrorSchema } from "../utils/error.js"
import type { FastifyReply } from "fastify/types/reply.js"
import type { CreateUserDTO } from "../type/user.type.js"
import { c_asyncHandler, type responseSchema } from "../utils/asyncHandler.js"
import type { providerSchema, queryOptions } from "../type/oauth.type.js"
import { ProviderExtractor, queryExtractor } from "../utils/oauthExtractor.js"


interface AuthControllerDeps {
    Auth: AuthServiceSchema,
    Error: ErrorSchema
}
const createAuthController = (opts: AuthControllerDeps) => {
    const register = c_asyncHandler(async (req: FastifyRequest<{ Body: CreateUserDTO }>, reply: FastifyReply) => {
        await opts.Auth.register(req.body);
        return {
            status: "ok",
            message: "please verify your email!"
        }
    })

    const loginWithPassword = c_asyncHandler(async (req: FastifyRequest<{ Body: object }>, reply: FastifyReply) => {
        const session = await opts.Auth.authenticate("password", req.body);
        return {
            status: "ok",
            message: "successfully login!",
            data: { token: session.a_token, expires_in: "15m" },
            cookies: [
                { name: "sid", value: session.s_token, path: "/", age: 1000 * 60 * 60 * 24 },
                { name: "rid", value: session.r_token, path: "/api/v1/auth/refresh", age: 1000 * 60 * 60 * 24 }
            ]
        } as responseSchema
    });

    const loginWithOauth = c_asyncHandler(async (req: FastifyRequest<{ Querystring: { provider: providerSchema } }>, reply: FastifyReply) => {
        const oauthRedirect = await opts.Auth.loginOauthInitiate(req.query.provider);
        return {
            status: "ok",
            cookies: [
                { name: "flowId", value: oauthRedirect.flow_id, path: `/api/v1/auth/${req.query.provider}/callback`, age: 1000 * 60 * 4 }
            ],
            redirect: true,
            url: oauthRedirect.redirect_uri
        }
    })

    const callbackOauth = c_asyncHandler(async (req: FastifyRequest<{ Querystring: queryOptions }>, reply: FastifyReply) => {
        const provider = ProviderExtractor(req.params);
        if (!provider) throw opts.Error.notFound("Invalid Provider!");
        const authParams = queryExtractor(req.query);
        if (authParams?.error) throw opts.Error.unAuthorized(authParams?.error_description);

        // check flow id
        const { flowId } = req.cookies;
        if (!flowId) throw opts.Error.notFound("AuthFlow not found!");
        const session = await opts.Auth.loginOauthAuthenticate(provider, authParams, { flowId });
        return {
            status: "ok",
            message: "successfully login!",
            data: { token: session.a_token, expires_in: "15m" },
            cookies: [
                { name: "sid", value: session.s_token, path: "/", age: 1000 * 60 * 60 * 24 },
                { name: "rid", value: session.r_token, path: "/api/v1/auth/refresh", age: 1000 * 60 * 60 * 24 }
            ]
        } as responseSchema
    })

    const authLink = c_asyncHandler(async (req: FastifyRequest, reply: FastifyReply) => {
        const { flowId } = req.params;
        const { provider, password } = req.body;
        const session = await opts.Auth.linkAccount(flowId, provider, password);
        
        return {
            status: "ok",
            message: "successfully login!",
            data: { token: session.a_token, expires_in: "15m" },
            cookies: [
                { name: "sid", value: session.s_token, path: "/", age: 1000 * 60 * 60 * 24 },
                { name: "rid", value: session.r_token, path: "/api/v1/auth/refresh", age: 1000 * 60 * 60 * 24 }
            ]
        } as responseSchema
    })

    return {
        register,
        loginWithPassword,
        loginWithOauth,
        callbackOauth,
        authLink
    }
}

export type AuthControllerSchema = ReturnType<typeof createAuthController>;
export default createAuthController;
