import { AuthProviderContract, createAuthProfile } from "../contracts.mjs";
import { request } from "../../infra/http/http-axios.mjs";
import config from "../../../envConfig.mjs";
import buildGoogleAuthUrl from '../utils/buildUrls.mjs';
import {oauth_jwtVerify} from '../../utils/TokenManager.mjs';
import AppError, { normalizeError } from "../../utils/Error.mjs";

export default class GoogleProvider extends AuthProviderContract{
    constructor(){
        super("google");
    }

    initiate(ctx){
        const {state,nonce,code_challenge} = ctx;
        const url = buildGoogleAuthUrl(state,{
            client_id:config.OAUTH.google.id,
            redirect_uri:config.OAUTH.google.redirect_uri,
            auth_uri:config.OAUTH.google.auth_url,
            response_type:"code",
            scope:"openid email profile",
            nonce,
            code_challenge,
            code_challenge_method:"S256"
        });
        return url;
    }

    async authenticate(ctx){
        const {code,nonce,code_verifier} = ctx;
        try{
            const {id_token} = await exchangeGoogleCode(code,code_verifier);
            const decoded = await oauth_jwtVerify(id_token,{
                jwks_uri:config.OAUTH.google.jwks_uri,
                issuer:"https://accounts.google.com",
                audience:config.OAUTH.google.id
            })
            const {nonce:decoded_nonce,sub,email,email_verified,name,given_name,picture} = decoded
            if(decoded_nonce!==nonce) throw AppError.known({
                message:"Invalid nonce!",
                status:401,
                code:"AUTH",
                layer:"layer.auth.provider",
                event:"event.google.authenticate"
            })
            return createAuthProfile({
                provider:"google",
                provider_user_id:sub,
                provider_email:email,
                provider_email_verified:email_verified,
                name:given_name,
                avatar:picture
            })
        }catch(error){
            throw normalizeError(error,{
                layer:"layer.auth.provider",
                event:"event.google.authenticate"
            })
        }
    }
}


async function exchangeGoogleCode(code,code_verifier){
    return request({
        method:"POST",
        requestUrl:config.OAUTH.google.oauth_token,
        headers:{
            "Content-Type":"application/json"
        },
        data:{
            code,
            client_id:config.OAUTH.google.id,
            client_secret:config.OAUTH.google.secret,
            redirect_uri:config.OAUTH.google.redirect_uri,
            grant_type:"authorization_code",
            code_verifier
        }
    })
}
