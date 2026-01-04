import { Router } from 'express';
import { c_asyncHandler } from '../utils/asyncHandler.mjs';

export default function UserRouter({
    UserHandler,
},options={}) {
    const router = new Router();

    router.get("/me", options.auth.checkAuth,c_asyncHandler( UserHandler.readProfile));
    router.delete("/me", options.auth.checkAuth, c_asyncHandler(UserHandler.destroy));
    router.patch("/me", options.auth.checkAuth, c_asyncHandler(UserHandler.update));
    router.patch("/me/password", options.auth.checkAuth, c_asyncHandler(UserHandler.updatePassword));
    router.get("/:userId", c_asyncHandler(UserHandler.read));
    
    return router;
}