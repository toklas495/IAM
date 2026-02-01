import type { AccountModelSchema } from "../../model/account.model.js";
import type { CredModelSchema } from "../../model/cred.model.js";
import type { UserModel } from "../../model/user.model.js";
import type { ErrorSchema } from "../../utils/error.js";
import type { AuthResult } from "./providers.services/provider.contract.js";

interface AccountServiceDeps {
    Error: ErrorSchema;
    Account: AccountModelSchema
    User: UserModel;
    Cred: CredModelSchema
}

const CreateAccountService = (opts: AccountServiceDeps) => {
    const resolveAccount = async (identity: AuthResult) => {
        if (identity.provider === "password") {
            const user = await opts.User.findById(identity.user_id);
            if (!user) throw opts.Error.notFound("User Not Found!");
            return { type: "OK", user };
        }

        const isProviderExist = await opts.Account.getAccountByProviderAndProviderUserId(identity.provider, identity.provider_user_id);
        if (isProviderExist) {
            const user = await opts.User.findById(isProviderExist.user_id);
            if (!user) throw opts.Error.notFound("User Not Found!");
            return { type: "OK", user };
        }

        const provider_email = identity.provider_email;
        const provider_email_verified = identity.metadata?.provider_email_verified;

        if (provider_email && provider_email_verified) {
            const isEmailExist = await opts.User.findByEmail(provider_email);
            if (isEmailExist) {
                const hasPassword = await opts.Cred.getCred(isEmailExist.id);
                if (hasPassword) {
                    if (isEmailExist.email_verified) return { type: "LINK_REQUIRED", reason: "PASSWORD_PROVIDER_EXIST" };
                    await opts.Cred.delCred(hasPassword.id);
                    await opts.User.setEmailVerified(isEmailExist.id);
                }

                await opts.Account.insertAccount({
                    provider: identity.provider,
                    provider_email: identity.provider_email,
                    provider_user_id: identity.provider_user_id,
                    user_id: isEmailExist.id
                })

                return { type: "OK", user: isEmailExist };
            }

            const n_user = await opts.User.create({
                username: identity.metadata.name,
                full_name: identity.metadata.name,
                email: identity.provider_email,
                email_verified: true
            });

            await opts.Account.insertAccount({
                provider: identity.provider,
                provider_email: identity.provider_email,
                provider_user_id: identity.provider_user_id,
                user_id: n_user.id
            })

            return { type: "OK", user: n_user };
        }
        const n_user = await opts.User.create({
            username: identity.metadata.name,
            full_name: identity.metadata.name,
            email: identity.provider_email,
        });

        await opts.Account.insertAccount({
            provider: identity.provider,
            provider_email: identity.provider_email,
            provider_user_id: identity.provider_user_id,
            user_id: n_user.id
        })

        return {type:"OK",user:n_user};
    }

    const linkAccount = async(primaryIdentity:AuthResult,secondaryIdentity:AuthResult)=>{
        if(primaryIdentity.provider==="password"){
            const user = await opts.User.findById(primaryIdentity.user_id);
            if(!user) throw opts.Error.notFound("User Not Found");
            await opts.Account.insertAccount({
                provider:secondaryIdentity.provider,
                provider_user_id:secondaryIdentity.provider_user_id,
                provider_email:secondaryIdentity.provider_email,
                user_id:user.id
            })
            return user;
        }
    }
    return {
        resolveAccount,
        linkAccount
    }
}

export type AccountServiceSchema = ReturnType<typeof CreateAccountService>;
export default CreateAccountService;