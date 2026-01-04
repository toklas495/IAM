import CreateAuthService from './auth.service.mjs';
import createOauthService from './oauth.service.mjs';
import createSessionService from './session.service.mjs';
import { getProvider } from '../../auth/registry.mjs';


export default function createAuth(options={}){
    const {SessionModel,UserModel,mailer,getCache,AuthAccModel} = options;
    const oauthService = createOauthService({getProvider,UserModel,AuthAccModel});
    const sessionService = createSessionService({SessionModel,getCache,AuthAccModel})
    const authService = CreateAuthService({
        UserModel,
        AuthAccModel,
        getCache,
        mailer,
        oauthService,
        sessionService
    });

    return authService;
}
// 