import type { CredSchema } from "../type/cred.type.js";
import type { ErrorSchema } from "../utils/error.js";
import type { Knex } from "knex";

type CredModelDep = {
    db:Knex,
    Error:ErrorSchema
}

const createCredModel = (opts:CredModelDep)=>{
    const insertCred = async(id:string,password:string):Promise<void>=>{
        await opts.db("credentials").insert({
            user_id:id,
            password_hash:password,
        })
    }

    const getCred = async(id:string)=>{
        return await opts.db("credentials").where({user_id:id}).first() as CredSchema;
    }

    const delCred = async(id:string)=>{
        return await opts.db("credentials").where({id}).del();
    }

    const delCredByUserId = async(user_id:string)=>{
        return await opts.db("credentials").where({user_id}).del();
    }

    return {
        insertCred,
        getCred,
        delCred,
        delCredByUserId
}
}

export type CredModelSchema = ReturnType<typeof createCredModel>;
export default createCredModel;
