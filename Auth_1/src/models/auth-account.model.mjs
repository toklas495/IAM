import AppError, { normalizeError } from "../utils/Error.mjs";

const createAuthAccountModel = function(db){

    const findPasswordAccountByUserId = async(user_id)=>{
        return await db("auth_accounts").where({user_id,provider:"password"}).first();
    };

    const findAccountByUserId = async(user_id)=>{
        return await db("auth_accounts").where({user_id});
    }

    const findAccountByAccId = async(id)=>{
        return await db("auth_accounts").where({id}).first();
    }

    const findByProviderAndProviderUserId = async({provider,provider_user_id})=>{
        return await db("auth_accounts").where({provider,provider_user_id}).first();
    };

    const createPasswordAccount = async({
        user_id,
        provider_email,
        provider_email_verified,
        password_hash
    })=>{
        try{
            const [n_acc]  = await db("auth_accounts").insert({
                provider:"password",
                user_id,
                provider_email,
                provider_email_verified,
                password_hash,
                provider_user_id:user_id
            }).returning("*");
            return n_acc;
        }catch(error){
            if(error.code==="23505"){
                throw AppError.known({
                    message:"already Exist!",
                    status:409,
                    layer:"layer.model",
                    event:"event.auth-account.createPasswordAccount"
                })
            }
            throw normalizeError(error,{layer:"layer.model",event:"event.auth-account.createPasswordAccount"})
        }
    };

    const createOauthAccount = async({
        provider,
        provider_user_id,
        user_id,
        provider_email,
        provider_email_verified
    })=>{
        try{
            const [n_acc] = await db("auth_accounts").insert({
                provider,
                provider_user_id,
                user_id,
                provider_email,
                provider_email_verified
            }).returning("*");
            return n_acc;
        }catch(error){
            if(error.code==="22505"){
                throw AppError.known({
                    message:"already Exist!",
                    status:409,
                    layer:"layer.model",
                    event:"event.auth-account.createOauthAccount"
                })
            }
            throw normalizeError(error,{layer:"layer.model",event:"event.auth-account.createOauthAccount"})
        }
    };
    const update = async(whereIsPayload,payload)=>{
        const [u_acc] = await db("auth_accounts")
                        .update(payload)
                        .where(whereIsPayload)
                        .returning("*");
        return u_acc;
    }
    const updateLastLogin = async(acc_id)=>{
        const last_login_at = new Date();
        return update({id:acc_id},{last_login_at});
    };

    const updateVerifyEmail = async({provider,user_id})=>{
        return update({provider,user_id},{provider_email_verified:true});
    }

    return {
        updateLastLogin,
        createOauthAccount,
        createPasswordAccount,
        findPasswordAccountByUserId,
        findByProviderAndProviderUserId,
        updateVerifyEmail,
        findAccountByUserId,
        findAccountByAccId,
        update
    }
}

export default createAuthAccountModel;