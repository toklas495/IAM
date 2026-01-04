import { Router } from 'express';
import { c_asyncHandler } from '../utils/asyncHandler.mjs';

export default function AuthRouter({
    AuthHandler
}, options = {}) {
    const router = new Router();
    router.get("/oauth",options.rateLimit.NormalLimit,c_asyncHandler(AuthHandler.oauthLogin));
    router.post("/login", options.rateLimit.HighLimit, c_asyncHandler(AuthHandler.login));
    router.post("/link/provider",options.rateLimit.HighLimit,c_asyncHandler(AuthHandler.linkProvider));
    router.get("/verify", options.rateLimit.NormalLimit, c_asyncHandler(AuthHandler.verifyEmail));
    router.post("/register", options.rateLimit.HighLimit, c_asyncHandler(AuthHandler.register));
    router.post("/refresh", options.rateLimit.HighLimit, c_asyncHandler(AuthHandler.refresh));
    router.post(
        "/logout",
        options.rateLimit.HighLimit,
        options.auth.checkAuth,
        c_asyncHandler(AuthHandler.logout
        ));
    router.post("/add-pass",options.rateLimit.HighLimit,options.auth.checkAuth,c_asyncHandler(AuthHandler.addPass));
    router.post("/forget-pass", options.rateLimit.HighLimit, c_asyncHandler(AuthHandler.forgetPassword));
    router.post("/reset-pass", options.rateLimit.HighLimit, c_asyncHandler(AuthHandler.resetPass));
    router.get("/google/callback",options.rateLimit.MediumLimit,c_asyncHandler(AuthHandler.oauthCallback));
    router.get("/github/callback",options.rateLimit.MediumLimit,c_asyncHandler(AuthHandler.oauthCallback));
    return router;
};






