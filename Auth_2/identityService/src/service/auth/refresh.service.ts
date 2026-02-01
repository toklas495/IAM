import type { RefreshModelSchema } from "../../model/refresh.model.js"
import type { ErrorSchema } from "../../utils/error.js"
import { genToken, hashSHA256 } from "../tokens/alg.token.js"

interface Options{
    Error:ErrorSchema,
    Refresh:RefreshModelSchema
}

export const createRefreshService = (opts:Options)=>{
    const createExpires = (expires_in:number=86400000)=>new Date(Date.now()+expires_in);
    const sanitizeRefreshToken = (session_id:string,token:string)=>{
        return {
            session_id,
            token,
            expires_at:createExpires(),
            revoked:false
        }
    }

    const createRefresh = async(session_id:string):Promise<string>=>{
        const token = genToken(64);
        const hash_token = hashSHA256(token);
        const r_option = sanitizeRefreshToken(session_id,hash_token);
        await opts.Refresh.create(r_option);
        return token;
    }

    

    return {
        createRefresh
    }
}

export type RefreshServcieSchema = ReturnType<typeof createRefreshService>;
export default createRefreshService;