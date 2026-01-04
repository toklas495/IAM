import { n_asyncHandler } from "../../utils/asyncHandler.mjs";
import { getProvider } from '../../auth/registry.mjs';
import tokenManager from "../../utils/TokenManager.mjs";
import AppError from "../../utils/Error.mjs";

const CreateAuthService = function (options={}) {
    const {UserModel,AuthAccModel,getCache,
        mailer,oauthService,sessionService
        }   = options;

    const checkIsExist = async (data={},ctx) => {
        const {email} = data;
        const isExistUser = await UserModel.read({ email });
        if (!isExistUser) return;
        const accounts = await AuthAccModel.findAccountByUserId(isExistUser.id);
        const providers = accounts.map(account => account.provider);
        if (providers.includes("password")) throw AppError.known({
            message: "An Account already exist with this email!",
            status: 409,
            event: "event.auth.checkIsExist",
            layer: "layer.service"
        })
        throw new AppError({
            code: "ACCOUNT_LINK_REQUIRED",
            message: "An Account already exist with this email! login with different method and add password!",
            status: 409,
            event: "event.auth.checkIsExist",
            layer: "layer.service"
        })
    }

    const create = n_asyncHandler(async (data={},ctx) => {
        const {username,full_name,email,password} = data;
        const payload = {
            username: username.toLowerCase(),
            full_name: full_name,
            email: email.toLowerCase()
        }
        await checkIsExist(email);
        const user_id = await UserModel.create(payload);

        ctx.s_log.info({event:"CREATE_USER_SUCCESSFULLY",user_id});

        const password_hash = await tokenManager.hashify(password).argon2();
        await AuthAccModel.createPasswordAccount({
            user_id: user_id,
            provider_user_id: user_id,
            provider_email: email,
            provider_eamil_verified: false,
            password_hash
        })
        ctx.s_log.info({event:"CREATE_ACCOUNT_SUCCESSFULLY"});
        const verify_token = tokenManager.genToken(32);
        const hash_verify_token = tokenManager.hashify(verify_token).SHA256();
        await getCache("auth").set({ user_id }, hash_verify_token, "VERIFY_EMAIL");
        mailer.send({to:email, key:"verify-email", params:{
            "{{__LINK__}}": `http://localhost:3000/api/v1/auth/verify?t=${verify_token}`,
            "{{__EXPIRE__}}": `15 min`,
            "{{__SUPPORT__}}": "admin@gmail.com"
        }});
        return user_id;
    })

    const verifyEmail = n_asyncHandler(async (data={},ctx) => {
        const {token}= data;
        const hash_token = tokenManager.hashify(token).SHA256();
        const cached = await getCache("auth").get(hash_token, "VERIFY_EMAIL");
        if (!cached) throw AppError.known({
            message: "Invalid token!",
            event: "event.authservice.auth.verifyEmail",
            status: 401,
            code: "AUTH",
            layer: "layer.service"
        })
        const { user_id } = cached;
        const user = await AuthAccModel.updateVerifyEmail({
            provider: "password",
            user_id
        })
        if (!user) throw AppError.known({
            message: "user not found!",
            layer: "layer.service",
            status: 401,
            event: "event.authservice.auth.verifyEmail",
            code: "AUTH"
        })
        ctx.s_log.info({event:"VERIFY_EMAIL_SUCCESSFULLY"});
        await getCache("auth").remove(hash_token, "VERIFY_EMAIL");
    })

    const oauthLogin = n_asyncHandler(async (data={},ctx) => {
        const {provider,old_flowId,flow} = data;
        const { url, state, nonce, code_verifier, flow_id} = await oauthService.oauthLogin({provider},ctx);
        let cached = {};
        let key_flow_id = old_flowId||flow_id
        if (old_flowId&&flow) {
            cached = { ...flow, status: "LINK_CONFIRMED" }
        }
        await getCache("auth").setTtl(600).set({
            provider,
            state,
            nonce,
            code_verifier,
            status: "OAUTH_INIT",
            ...cached
        }, `flow:${key_flow_id}`);
        ctx.s_log.info({event:"OAUTH_LOGIN_INTIATED",flow_id:key_flow_id});
        return {
            redirect_url: url,
            session_id: key_flow_id
        }
    })

    const linkProvider = n_asyncHandler(async (data={},ctx) => {
        const { provider, flow_id,name,password } = data;
        const flow = await getCache("auth").get(`flow:${flow_id}`);
        if(!flow) throw AppError.known({message:"session not exist or expired",status:404,layer:"layer.service",event:"event.auth.linkProvider"});
        if (!["oauth", "password"].includes(provider)) throw AppError.known({ message: "invalid provider!", status: 400, event: "event.auth.linkProvider", layer: "layer.service" })
        switch (provider) {
            case "oauth":
                return await oauthLogin(data,ctx);
            case "password":
                const user = await UserModel.read({id:flow.user_id});
                if(!user) throw new AppError({message:"user not found!",status:404,layer:"layer.service",event:"event.auth.linkProvider"});
                const auth_account = await AuthAccModel.findPasswordAccountByUserId(user.id);
                await getProvider("password").authenticate({auth_account,password});
                const provider_email = flow.provider_eamil_address||auth_account.provider_email;
                const email_verified = flow.provider_email_verfied||auth_account.provider_email_verfied
                const account = await AuthAccModel.createOauthAccount({
                    provider:flow.n_provider,
                    provider_user_id:flow.provider_user_id,
                    user_id:user.id,
                    provider_email:provider_email,
                    provider_email_verfied:email_verified,
                    last_login_at:new Date()
                })
                ctx.s_log.info({event:"ACCOUNT_CREATED_SUCCESSFULLY",account_id:account.id});
                const data = {user_id:user.id,email_verified,provider:flow.n_provider,account_id:account.id};
                return sessionService.createSession(data,ctx);
            default:
                throw new AppError({
                    message:"invalid provider",
                    status:400,
                    layer:"layer.service",
                    event:"event.auth.linkProvider"
                })       
        }
    })

    const oauthCallback = n_asyncHandler(async (data={},ctx) => {
        const { code, state, session_id } = data;
        const cached = await getCache("auth").get(`flow:${session_id}`);
        if (!cached) throw AppError.known({
            message: "session not exist or expired!",
            status: 401,
            code: "AUTH",
            layer: "layer.service",
            event: "event.authService.auth.oauthCallback"
        });
        const { provider, code_verifier, state: state_token, nonce, status } = cached;
        if (state !== state_token) throw AppError.known({
            message: "invalid state-token!",
            status: 401,
            layer: "layer.service",
            event: "event.authService.auth.oauthCallback"
        })
        try {
            let user;
            if (status === "LINK_CONFIRMED") {
                user = await oauthService.linkOauthCallback({provider, options:{ code, ...cached }},ctx);
                ctx.s_log.info({event:"LINK_CONFIRMED_SUCCESSFULLY"});
            } else user = await oauthService.oauthCallback({provider, options:{ code, nonce, code_verifier }},ctx);
            await getCache("auth").remove(`flow:${session_id}`);
            const data = {user_id:user.id,email_verified:user.email_verified,provider:user.provider,account_id:user.account_id};
            return sessionService.createSession(data,ctx);
        } catch (err) {
            if (err instanceof AppError && err?.code === "ACCOUNT_LINK_REQUIRED") {
                const {
                    user_id,
                    provider_user_id,
                    provider,
                    provider_eamil_verified,
                    provider_email_address,
                    providers = []
                } = err?.detail;
                await getCache("auth").setTtl(600).set(
                    {
                        provider_user_id,
                        user_id,
                        status: "LINK_REQUIRED",
                        n_provider: provider,
                        provider_eamil_verified,
                        provider_email_address,
                        providers: providers
                    },
                    `flow:${session_id}`
                )
                throw AppError.known({
                    message: `An account already exist with this email and is linked to ${providers?.join(",")}`,
                    status: 409,
                    code: "ACCOUNT_LINK_REQUIRED",
                    event: "event.auth.oauthCallback",
                    layer: "layer.service",
                    url: `?flow_id:${session_id}`
                })
            }
            //  failure kill flow
            await getCache("auth").remove(`flow:${session_id}`);
            throw err;
        }
    })

    const passwordLogin = n_asyncHandler(async (data={},ctx) => {
        const {username,email,password} = data;
        if (!password) throw AppError.known({
            status: 400,
            message: "password is required",
            code: "BAD_REQ",
            layer: "layer.service",
            event: "event.authService.auth.passwordLogin"
        });
        if (!username && !email) throw AppError.known({
            status: 400,
            message: "username or eamil is required!",
            code: "BAD_REQ",
            layer: "layer.service",
            event: "event.authService.auth.passwordLogin"
        });
        const where_payload = {
            ...(username !== undefined && { username }),
            ...(email !== undefined && { email })
        }
        const user = await UserModel.read(where_payload);
        if(!user) throw new AppError({message:"user not found!",status:404,layer:"layer.service",event:"event.auth.passwordLogin"});
        const auth_account = await AuthAccModel.findPasswordAccountByUserId(user.id);
        const {provider_email_verified,provider} = await getProvider("password").authenticate({ auth_account, password });
        const session_data = {
            user_id:user.id,
            email_verified:provider_email_verified,
            provider,
            account_id:auth_account.id
        }
        return sessionService.createSession(session_data,ctx);
    })

    const logout = n_asyncHandler(async (data={},ctx) => {
        const sessions = await sessionService.sessionLogout(data,ctx);
        if (!sessions) throw AppError.known({
            message: "invalid token!",
            status: 400,
            event: "event.authSerice.auth.logout",
            layer: "layer.service",
            code: "BAD_REQ"
        });
        ctx.s_log.info({event:"SESSION_LOGOUT_SUCCESSFULLY"});
        await Promise.all(sessions.map(session => {
            return getCache("auth").set(true, session.jwt_id, session.user_id, "auth:verify-token");
        }))
    })

    const refresh_TOKEN = n_asyncHandler(async (data,ctx) => {
        return sessionService.refreshToken(data,ctx);
    })

    const verifyJWT_TOKEN = n_asyncHandler(async (data={},ctx) => {
        const {jwt} = data;
        const session = await tokenManager.jwtVerify(getCache("secret"), jwt);
        const cached = await getCache("auth").get(session.jti, session.user_id, "auth:verify-token");
        if (cached) {
            throw AppError.known({
                message: "Invalid token!",
                event: "event.authService.auth.verifyJWT_TOKEN",
                layer: "layer.service",
                status: 401
            })
        }
        return session;
    })

    const forgetPassword = n_asyncHandler(async (data,ctx) => {
        const {username,email} = data;
        const payload = {
            ...(username !== undefined && { username }),
            ...(email !== undefined && { email })
        }
        const user = await UserModel.read(payload);
        if (!user) {
            throw AppError.known({message:"user not found!",status:404,layer:"layer.service",event:"event.auth.forgetPassword"});
        }
        const account = await AuthAccModel.findPasswordAccountByUserId(user.id);
        if(!account) {
            throw AppError.known({message:"account not found!",status:404,layer:"layer.service",event:"event.auth.forget_password"});
        }
        const { email: user_email, id } = user;
        const reset_pass_token = tokenManager.genToken(32);
        const hash_pass_token = tokenManager.hashify(reset_pass_token).SHA256();
        await getCache("auth").set({user_id: id,account_id:account.id}, hash_pass_token, "reset-pass");
        ctx.s_log.info({event:"FORGET_PASSWORD_SUCCESSFULLY"});
        await mailer.send({to:user_email, key:"reset-pass", params:{
            "{{__LINK__}}": `http://localhost:3000/api/v1/auth/reset-pass?t=${reset_pass_token}`,
            "{{__EXPIRE__}}": "15 m",
            "{{__SUPPORT__}}": "admin@gmail.com"
        }});
    })


    const resetPass = n_asyncHandler(async (data={},ctx) => {
        const {token,password} = data;
        const hash_token = tokenManager.hashify(token).SHA256();
        const cached = await getCache("auth").get(hash_token, "reset-pass");
        if (!cached) throw AppError.known({
            isknown: true,
            message: "invalid Token!",
            event: "auth:reset",
            status: 400
        })
        const { user_id,account_id } = cached;
        const password_hash = await tokenManager.hashify(password).argon2();
        await AuthAccModel.update({id:account_id},{password_hash});
        await getCache("auth").remove(hash_token, "reset-pass");
        await logout(user_id, undefined, true);
    })

    const addPass  = n_asyncHandler(async(data={},ctx)=>{
        const {password,user_id,account_id} = data;
        const exist_account = await AuthAccModel.findPasswordAccountByUserId(user_id);
        if(exist_account) throw AppError.known({message:"Password already set. Use reset password",status:409,layer:"layer.service",event:"event.auth.addPass"});
        const account = await AuthAccModel.findAccountByAccId(account_id);
        if(!account) throw AppError.known({message:"Invalid account!",status:404,layer:"layer.service",event:"event.auth.addPass"});
        const password_hash = await tokenManager.hashify(password).argon2();
        await AuthAccModel.createPasswordAccount({
            user_id,
            provider:"password",
            provider_email:account.provider_email,
            provider_eamil_verified:account?.provider_email_verfied,
            password_hash,
            last_login_at:new Date()
        })
        ctx.s_log.info({event:"ADD_PASS_SUCCESSFULLY"});
    })

    return {
        verifyJWT_TOKEN,
        refresh_TOKEN,
        logout,
        passwordLogin,
        create,
        verifyEmail,
        forgetPassword,
        resetPass,
        oauthLogin,
        oauthCallback,
        linkProvider,
        addPass
    }
}


export default CreateAuthService;