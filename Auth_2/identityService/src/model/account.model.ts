import type{Knex} from 'knex';
import type { ErrorSchema } from '../utils/error.js';
import type { AccountSchema } from '../type/account.type.js';

type AccountModelDep = {
    Error:ErrorSchema,
    db:Knex
}

const createAccountModel = (opts:AccountModelDep)=>{
    const insertAccount = async (account_payload:object)=>{
        const [account] = await opts.db("accounts").insert(account_payload).returning("*");
        return account as AccountSchema;
    };
    const getAccountById = async (id:string)=>{
        return await opts.db("accounts").where({id}).first() as AccountSchema|null;
    };
    const getAccountByProviderAndUserId = async (provider:string,user_id:string)=>{
        return await opts.db("accounts").where({provider,user_id}).first() as AccountSchema|null;
    };
    const getAccountByUserId = async (user_id:string)=>{
        return await opts.db("accounts").where({user_id}).first() as AccountSchema|null;
    };
    const getAccountByProviderEmail = async (email:string)=>{
        return await opts.db("accounts").where({email}).first() as AccountSchema|null;
    };
    const getAccountByProviderAndProviderUserId = async(provider:string,provider_user_id:string)=>{
        return await opts.db("accounts").where({provider,provider_user_id}).first() as AccountSchema|null;
    }
    return {
        getAccountByProviderEmail,
        getAccountById,
        getAccountByProviderAndUserId,
        getAccountByUserId,
        insertAccount,
        getAccountByProviderAndProviderUserId
    }
}

export type AccountModelSchema = ReturnType<typeof createAccountModel>;
export default createAccountModel;