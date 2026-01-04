import { AuthProviderContract, createAuthProfile } from "../contracts.mjs";
import buildGoogleAuthUrl from "../utils/buildUrls.mjs";
import config from "../../../envConfig.mjs";
import { request } from "../../infra/http/http-axios.mjs";
import AppError, { normalizeError } from "../../utils/Error.mjs";


export default class GithubProvider extends AuthProviderContract{
    constructor(){
        super("github");
        //binding
        this.initiate = this.initiate.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.exchangeCode = this.exchangeCode.bind(this);
        this.getProfile = this.getProfile.bind(this);
    }
    initiate(ctx){
        const {state,code_challenge} = ctx;
        const url = buildGoogleAuthUrl(state,{
            client_id:config.OAUTH.github.id,
            redirect_uri:config.OAUTH.github.redirect_uri,
            auth_uri:config.OAUTH.github.auth_url,
            response_type:"code",
            scope:"user:email profile",
            code_challenge,
            code_challenge_method:"S256"
        })
        return url;
    }

    async authenticate(ctx){
        const {code,code_verifier} = ctx;
        try{
            const {access_token} = await this.exchangeCode(code,code_verifier);
            const user_info = await this.getProfile(access_token);
            return createAuthProfile({
                provider:"github",
                provider_user_id:user_info.id,
                provider_email:user_info?.email,
                provider_email_verified:user_info?.email_verified||false,
                name:user_info?.login,
                avatar:user_info?.avatar_url
            })
        }catch(error){ 
            throw normalizeError(error,{
                layer:"layer.auth.provider",
                event:"event.github.authenticate"
            })
        }
    }

    async exchangeCode(code,code_verifier){
        return request({
            method:"POST",
            requestUrl:config.OAUTH.github.oauth_token,
            headers:{
                "Content-Type":"application/json",
                "Accept": "application/json"
            },
            data:{
                code,
                client_id:config.OAUTH.github.id,
                client_secret:config.OAUTH.github.secret,
                redirect_uri:config.OAUTH.github.redirect_uri,
                grant_type:"authorization_code",
                code_verifier
            }
        })
    }

    async getProfile(access_token){
        return request({
            method:"GET",
            requestUrl:"https://api.github.com/user",
            headers:{
                "Accept":"application/json",
                "Authorization":`Bearer ${access_token}`
            }
        })
    }
}



