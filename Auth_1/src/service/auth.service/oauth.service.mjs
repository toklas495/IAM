import AppError from "../../utils/Error.mjs";
import { genToken, pkceGen, genUser } from "../../utils/TokenManager.mjs";

function createOauthService(options = {}) {
    const { getProvider, UserModel, AuthAccModel } = options;

    const checkProvider = (provider) => {
        const providers = ["google", "github"];
        if (!providers.includes(provider)) return true;
        return false;
    }

    const oauthLogin = async (data,ctx) => {
        const {provider} = data;
        if (checkProvider(provider)) throw AppError.known({
            message: "Invalid Provider!",
            event: "event.authService.oauth",
            layer: "layer.service",
            status: 400
        });
        let [state, flow_id] = Array.from({ length: 3 }, () => genToken(32));
        let nonce = provider !== "github" ? genToken(32) : undefined;
        const { code_verifier, code_challenge } = pkceGen();
        const url = getProvider(provider).initiate({ state, nonce, code_challenge });
        return {
            url,
            state,
            nonce,
            flow_id,
            code_verifier
        }
    }

    const oauthCallback = async (data,ctx) => {
        const {provider,options} = data;
        if (checkProvider(provider)) throw AppError.known({
            message: "Invalid Provider!",
            status: 400,
            event: "event.authService.oauth",
            layer: "layer.service"
        });
        const { code, nonce, code_verifier } = options;
        const AuthProfile = await getProvider(provider).authenticate({ code, nonce, code_verifier });
        ctx.s_log.info({event:"AUTHPROFILE_AUTHENTICATE_SUCCESSFULLY",provider});
        const isUserExist = await checkUserIsExist({authProfile:AuthProfile});
        if (isUserExist) return {
             id: isUserExist.user_id, 
             email_verified: isUserExist.provider_email_verified,
             provider:isUserExist.provider,
             account_id:isUserExist.id
            };
        const username = genUser(AuthProfile?.provider_email || AuthProfile?.name);
        const n_user = await UserModel.create({
            email: AuthProfile?.provider_email,
            username,
            full_name: AuthProfile.name,
        })
        const account = await AuthAccModel.createOauthAccount({
            provider: AuthProfile.provider,
            provider_user_id: AuthProfile.provider_user_id,
            user_id: n_user,
            provider_email: AuthProfile.provider_email,
            provider_email_verified: AuthProfile.provider_email_verified,
            last_login_at: new Date()
        })
        ctx.s_log.info({event:"CREATE_ACCOUNT_SUCCESSFULLY",account_id:account.id});
        return { 
            id: n_user, 
            email_verified: AuthProfile.provider_email_verified,
            provider:account.provider,
            account_id:account.id
        };
    }

    const linkOauthCallback = async (data,ctx) => {
        const {provider,options={}} = data;
        if (checkProvider(provider))  throw AppError.known({
            message: "Invalid Provider!",
            status: 400,
            event: "event.authService.oauth",
            layer: "layer.service"
        });
        const {code_verifier,code,nonce} = options;
        const AuthProfile = await getProvider(provider).authenticate({code,nonce,code_verifier});
        ctx.s_log.info({event:"AUTHPROFILE_AUTHENTICATE_SUCCESSFULLY",provider});
        const accountExist = await AuthAccModel.findByProviderAndProviderUserId({
            provider,
            provider_user_id:AuthProfile.provider_user_id
        })
        if(!accountExist) throw AppError.known({
            message:"Invalid Account to validate!",
            status:401,
            layer:"layer.service",
            event:"event.auth.oauth.linkOauthCallback"
        })
        const email_verified = accountExist.provider_email_verified||options.provider_email_verified;
        const email_address = accountExist.provider_email||options.provider_email_address;
        const account = await AuthAccModel.createOauthAccount({
            provider:options.n_provider,
            provider_user_id:options.provider_user_id,
            user_id:accountExist.user_id,
            provider_email:email_address,
            provider_emial_verified:email_verified,
            last_login_at:new Date()
        })
        ctx.s_log.info({event:"ACCOUNT_CREATED_SUCCESSFULLY",account_id:account.id});
        return {
            id:accountExist.user_id,
            email_verified:email_verified,
            provider:account.provider,
            account_id:account.id
        };
    }

    const checkUserIsExist = async (data,ctx) => {
        const {authProfile} = data;
        const { provider_email, provider_user_id, provider } = authProfile;
        const accountExist = await AuthAccModel.findByProviderAndProviderUserId({
            provider,
            provider_user_id
        })
        if (accountExist) return accountExist;
        const UserExist = await UserModel.read({ email: provider_email });
        if (UserExist) {
            const accounts = await AuthAccModel.findAccountByUserId(UserExist.id);
            const providers = accounts.map(account => account.provider);
            throw AppError.known({
                code: "ACCOUNT_LINK_REQUIRED",
                message: `An account already exists with this email and is linked to ${providers.join(",")}`,
                detail: {
                    provider_user_id: authProfile.provider_user_id,
                    user_id:UserExist.id,
                    provider,
                    provider_email_verified: authProfile.provider_email_verified,
                    provider_email_address: authProfile.provider_email,
                    providers,
                }
            })
        }
        return undefined;
    }

    return {
        oauthLogin,
        oauthCallback,
        linkOauthCallback
    }
}

export default createOauthService;