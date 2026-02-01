import type { providerSchema } from "../../../../type/oauth.type.js";
import type { ErrorSchema } from "../../../../utils/error.js";
import type { AuthProvider, AuthResult } from "../provider.contract.js";
import Request from '../../../../core/http/index.js';
import { envConfig } from "../../../../config/index.js";
import { oauthJwtVerify } from "../../../tokens/auth.token.js";

type ClientSchema = {
    state:string;
    code:string;
}

type ServerSchema = {
    state:string;
    codeVerifier:string;
    nonce:string;
    code_challenge?:string;
    code_challenge_method?:string;
}

interface googleOptionSchema{
    client:ClientSchema
    server:ServerSchema
}

interface providerOptions{
    Error:ErrorSchema
}



class GoogleProvider implements AuthProvider{
    name:providerSchema = "google";
    readonly Error:ErrorSchema;
    constructor(opts:providerOptions){
        this.Error = opts.Error;

        // binding
        this.tokenEndpointRequest = this.tokenEndpointRequest.bind(this);
        this.authenticate = this.authenticate.bind(this);
    }

    private async tokenEndpointRequest(code:string,codeVerifier:string){
        return Request({
            method:"POST",
            url:envConfig.oauth.google.token_url,
            headers:{
                "Content-Type":"application/json"
            },
            data:{
                grant_type:"authorization_code",
                code,
                code_verifier:codeVerifier,
                client_id:envConfig.oauth.google.client,
                client_secret:envConfig.oauth.google.secret,
                redirect_uri:envConfig.oauth.google.redirect_url
            }
        })
    }

    initiate(opts:ServerSchema){
        const gConfig =envConfig.oauth.google;
        const googleOauthUri = [
            `client_id=${gConfig.client}`,
            `redirect_uri=${gConfig.redirect_url}`,
            `scope=${gConfig.scope}`,
            `response_type=code`,
            `prompt=consent`,
            `state=${opts.state}`,
            `nonce=${opts.nonce}`,
            `code_challenge=${opts.code_challenge}`,
            `code_challenge_method=${opts.code_challenge_method||"S256"}`
        ]
        return gConfig.oauth_url+"?"+googleOauthUri.join("&").trim();
    }

    async authenticate(opts:googleOptionSchema): Promise<AuthResult> {
        const {client,server} = opts;

        if(client.state!==server.state) throw this.Error.unAuthorized("invalid state!");
        const {id_token}  = await this.tokenEndpointRequest(client.code,server.codeVerifier);
        const decoded = await oauthJwtVerify(
            id_token,
            envConfig.oauth.google.jwks_uri,
            "https://accounts.google.com",
            envConfig.oauth.google.client
        )
        if(decoded.nonce!==server.nonce){
            throw this.Error.unAuthorized("Invalid nonce!");
        }

        return {
            provider:"google",
            provider_user_id:decoded.sub,
            provider_email:decoded.email,
            user_id:"",
            metadata:{
                provider_email_verified:decoded.email_verified,
                name:decoded.name,
                avatar:decoded.picture
            }
        } as AuthResult
    }
}

export default GoogleProvider;