import {register} from '../auth/registry.mjs';
import GoogleProvider from '../auth/providers/google.provider.mjs';
import PasswordProvider from '../auth/providers/password.provider.mjs';
import GithubProvider from '../auth/providers/github.provider.mjs';
import createRequestContext from '../middleware/request.middleware.mjs';
import CreateLogger from '../middleware/logger.middleware.mjs';

import { getMail } from '../service/mail.service.mjs';
import CreateRateLimit from '../middleware/rateLimit.middleware.mjs';
import { getCache } from '../utils/Cache.mjs';
import db from '../infra/db/index.mjs';
import createAuth from '../middleware/auth.middleware.mjs';

import AuthService from '../service/auth.service/index.mjs';
import UserService from '../service/user.service.mjs';

import SessionModel from '../models/session.model.mjs';
import UserModel from '../models/user.model.mjs';
import createAuthAccountModel from '../models/auth-account.model.mjs';


import AuthController from '../controller/auth.controller.mjs';
import UserController from '../controller/user.controller.mjs';


import IndexRoutes from "../routes/index.mjs";

export default function CreateContainer(){

    const rateLimit = CreateRateLimit();
    const reqLogMiddleware = CreateLogger();
    const reqIdMiddleware = createRequestContext();
    const mailer = getMail();

    register(new GoogleProvider());
    register(new PasswordProvider());
    register(new GithubProvider());
    
    const sessM = new SessionModel(db);
    const userM = new UserModel(db);
    const authAccM = new createAuthAccountModel(db);


    const authS = new AuthService({UserModel:userM,getCache,mailer,SessionModel:sessM,AuthAccModel:authAccM})
    const userS = new UserService({UserModel:userM,getCache});


    const authC = new AuthController({AuthService:authS});
    const userC = new UserController({UserService:userS});

    const auth = createAuth({AuthService:authS});

    const router = IndexRoutes({
        UserHandler:userC,
        AuthHandler:authC,
    },{rateLimit,auth});

    return {
        router,
        sessM,
        userM,
        authS,
        userS,
        authC,
        userC,
        auth,
        reqIdMiddleware,
        reqLogMiddleware
    }
}