import { getCache } from "../../core/redis/cache.registry.js";
import type { SessionModelSchema } from "../../model/session.model.js";
import type { sessionMetaData, sessionOptionsDto } from "../../type/session.type.js";
import type { UserSchema } from "../../type/user.type.js";
import type { ErrorSchema } from "../../utils/error.js";
import { genToken, hashSHA256 } from "../tokens/alg.token.js";
import {createJwt, type JwtSchema } from "../tokens/auth.token.js";
import type { RefreshServcieSchema } from "./refresh.service.js";

interface Options{
    Error:ErrorSchema;
    Session:SessionModelSchema;
    Refresh:RefreshServcieSchema
}

const createSessionService = (opts:Options)=>{
    // jsonwebtoken
    const JsonWebToken:JwtSchema = createJwt(opts);

    const sanitizeSessionOption = (user:UserSchema,metadata:sessionMetaData,session_token:string,jwt_id:string)=>{
        const {user_agent,ip_address,device_id,device_info} = metadata;
        const {id:user_id} = user;
        return {
            user_id,
            session_token,
            jwt_id,
            revoked:false,
            expires_at:createExpires(),
            ...(user_agent!==undefined&&{user_agent}),
            ...(ip_address!==undefined&&{ip_address}),
            ...(device_id!==undefined&&{device_id}),
            ...(device_info!==undefined&&{device_info})
        }
    }

    const createExpires = (expires_in:number=86400000)=>{
        return new Date(Date.now()+expires_in);
    }

    const createSession = async(user:UserSchema,metadata:sessionMetaData)=>{
        const [s_token,jwt_id] = [genToken(64),genToken(32)];
        const hs_token = hashSHA256(s_token);
        const s_option = sanitizeSessionOption(user,metadata,hs_token,jwt_id);
        const n_session = await opts.Session.create(s_option);
        const r_token = await opts.Refresh.createRefresh(n_session.id);
        const jwtSign = await JsonWebToken.jwtSign();
        const a_token = jwtSign({
            user_id:n_session.user_id
            },15,jwt_id);
        return {
            s_token,
            r_token,
            a_token
        }
    }
    return {
        createSession
    }
}

export type SessionServiceSchema = ReturnType<typeof createSessionService>;
export default createSessionService;

