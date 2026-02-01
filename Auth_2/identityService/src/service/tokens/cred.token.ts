import type { CredModelSchema } from "../../model/cred.model.js";
import type { ErrorSchema } from "../../utils/error.js";
import { hashArgon2, verifyArgon2 } from "./alg.token.js";


interface Options{
    Cred:CredModelSchema,
    Error:ErrorSchema
}
const createCredService = (opts:Options)=>{
    const createCred = async(password:string,user_id:string):Promise<void>=>{
        const password_hash = await hashArgon2(password);
        await opts.Cred.insertCred(user_id,password_hash);
    }
    const checkCred = async(password:string,user_id:string):Promise<void>=>{
        const cred = await opts.Cred.getCred(user_id);
        if(!await verifyArgon2(cred.password_hash,password)){
            throw opts.Error.invalidCred();
        }
    }

    const isCred = async(user_id:string):Promise<boolean>=>{
        const cred = await opts.Cred.getCred(user_id);
        return cred!==undefined;
    }
    return {
        createCred,
        checkCred,
        isCred
    }
}

export type CredServiceSchema = ReturnType<typeof createCredService>;
export default createCredService;