import type { ErrorSchema } from "../utils/error.js";
import type {  UserSchema } from "../type/user.type.js"
import type { Knex } from "knex";

type UserModelDeps = {
    db:Knex,
    Error:ErrorSchema
}

const createUserModel = (opts:UserModelDeps)=>{
    const create = async(payload:object)=>{
        const [n_user] = await opts.db("users").insert(payload).returning("*");
        return n_user as UserSchema;
    }

    const findById = async(id:string)=>await opts.db("users").where({id}).first() as UserSchema|null;
    const findByUsername = async(username:string)=>await opts.db("users").where({username}).first() as UserSchema|null;
    const findByEmail = async(email:string)=>await opts.db("users").where({email}).first() as UserSchema|null;
    const findByEmailOrUsername = async(email:string,username:string)=>{
        return await opts.db("users").where(builder=>{
            builder.where("email",email)
            .orWhere("username",username)
        }).first();
    }
    const update = async(id:string,payload:object)=>{
        return await opts.db("users").update(payload).where({id}).returning("*");
    }

    const setEmailVerified = async(id:string)=>{
        return update(id,{email_verified:true});
    }

    return {
        findById,
        create,
        findByUsername,
        findByEmail,
        findByEmailOrUsername,
        setEmailVerified
    }
}

export type UserModel = ReturnType<typeof createUserModel>;
export default createUserModel;