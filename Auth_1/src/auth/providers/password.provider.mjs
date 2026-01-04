import { AuthProviderContract, createAuthProfile } from "../contracts.mjs";
import { hashVerify } from "../../utils/TokenManager.mjs";
import AppError from "../../utils/Error.mjs";

export default class PasswordProvider extends AuthProviderContract{
    constructor(){
        super("password");
        //binding
        this.authenticate = this.authenticate.bind(this);
        this.verifyPassword = this.verifyPassword.bind(this);
    }

    async authenticate(ctx){
        const {auth_account,password} = ctx;
        const valid = await this.verifyPassword(auth_account.password_hash,password);
        if(!valid) throw AppError.known({
            message:"Invalid Cred!",
            status:404,
            layer:"layer.auth.provider",
            event:"event.password.authenticate",
            code:"NOT_FOUND"
        })
        return createAuthProfile({
            provider:"password",
            provider_user_id:auth_account.user_id,
            provider_email:auth_account.provider_email,
            provider_email_verified:auth_account.provider_email_verfied
        })
    }

    async  verifyPassword(digest,payload){
        return await hashVerify(payload,digest).argon2();
    }
}

