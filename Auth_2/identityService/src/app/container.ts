import createError from "../utils/error.js";
import createUserModel from "../model/user.model.js";
import createCredModel from "../model/cred.model.js";
import { db } from "../core/db/knex.index.js";
import createAuthService from "../service/auth/auth.service.js";
import createAuthController from "../controller/auth.controller.js";
import createSessionModel from "../model/session.model.js";
import createRefreshModel from "../model/refresh.model.js";
import createCredService from "../service/tokens/cred.token.js";
import createSessionService from "../service/auth/session.service.js";
import createRefreshService from "../service/auth/refresh.service.js";
import CreateAccountService from "../service/auth/account.service.js";
import { registerProvider } from "../service/auth/providers.services/provider.register.js";
import PasswordProvider from "../service/auth/providers.services/providers/password.provider.js";
import GoogleProvider from "../service/auth/providers.services/providers/google.provider.js";
import createAccountModel from "../model/account.model.js";

export default function createContainer(){
    const Error = createError();
    const userModel  = createUserModel({Error,db}); 
    const credModel = createCredModel({Error,db});
    const sessionModel = createSessionModel({Error,db});
    const refreshModel = createRefreshModel({Error,db});
    const accountModel = createAccountModel({Error,db});
    

    // service layer
    const credService = createCredService({Cred:credModel,Error});
    const refreshService = createRefreshService({Refresh:refreshModel,Error:Error});
    const sessionService = createSessionService({Session:sessionModel,Error,Refresh:refreshService})
    const accountService = CreateAccountService({Error,User:userModel,Cred:credModel,Account:accountModel});
    
    // providers
    const passwordProvider = new PasswordProvider({User:userModel,Error,Cred:credService});
    const googleProvider = new GoogleProvider({Error});
    registerProvider(passwordProvider);
    registerProvider(googleProvider);

    const authService = createAuthService({Error,Cred:credService,Session:sessionService,User:userModel,Account:accountService});

    // controller
    const authController = createAuthController({Error,Auth:authService});
    return {
        Auth:authController
    }
}

export type ContainerSchema = ReturnType<typeof createContainer>;