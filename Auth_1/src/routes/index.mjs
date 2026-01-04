import AuthRouter from './auth.route.mjs';
import UserRouter from './user.route.mjs';
import { Router } from 'express';


export default function IndexRoutes({
    UserHandler,
    AuthHandler
},options={}) {
    const router = new Router();
    // middleware
    router.use(options.auth.authMiddleware);
    router.use("/users", UserRouter({UserHandler},options));
    router.use("/auth", AuthRouter({AuthHandler},options));

    return router;
}
