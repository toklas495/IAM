import  { genToken, hashify, ranToken,jwtSign } from "../../utils/TokenManager.mjs"

function createSessionService(options={}){  
    const session_exp = options?.session_exp||(1000*60*60*24);
    const session_limit = options?.session_limit||5;
    
    const createSession = async(data={},ctx)=>{
        const {user_id,email_verified,provider,account_id} = data;
        const [r_token,s_token] = Array.from({length:2},()=>genToken(64));
        const jwt_id = ranToken();
        // hashify
        const [h_rtoken,h_stoken] = [r_token,s_token].map(token=>hashify(token).SHA256());
        const expires_at = new Date(Date.now()+session_exp);
        // store in db
        await options.SessionModel.insertToken({
            user_id,
            account_id,
            session_token:h_stoken,
            refresh_token:h_rtoken,
            jwt_id,
            expires_at,
            session_limit
        })
        ctx.s_log.info({event:"SESSION_CREATED_SUCCESSFULLY",user_id,account_id});
        const cache = options.getCache("secret");
        const sign = await jwtSign(cache);
        const access_token = sign({user_id,email_verified,provider,account_id},15,jwt_id);
        return {access_token,refresh_token:r_token,session_token:s_token};
    }

    const refreshToken = async(data={},ctx)=>{
        const {sid,rid} = data;
        const [hsid,hrid] = [sid,rid].map(token=>hashify(token).SHA256());
        const n_rid = genToken(64);
        const h_nrid = hashify(n_rid).SHA256();
        const jwt_id = ranToken();
        const {user_id,account_id} = await options.SessionModel.refreshToken(hsid,hrid,h_nrid,jwt_id);
        const account = await options.AuthAccModel.findAccountByAccId(account_id);
        const sign = await jwtSign();
        const access_token = sign({
            user_id,
            email_verified:account.email_verified,
            provider:account.provider,
            account_id
        },15,jwt_id);
        ctx.s_log.info({event:"REFRESH_TOKEN_SUCCESSFULLY",account_id,user_id});
        return {access_token,refresh_token:n_rid,session_token:sid};
    }

    const sessionLogout = async(data={},ctx)=>{
        const {user_id,sid,all=false} = data;
        const whereIsPayload = {
            user_id,
            ...(!all &&{session_token:hashify(sid).SHA256()}),
            revoked:false
        }
        const sessions = await options.SessionModel.updateToken(whereIsPayload,{revoked:true});
        if(!sessions||(Array.isArray(sessions)&&sessions.length===0)) return null;
        return sessions;
    }

    return {
        createSession,
        refreshToken,
        sessionLogout
    }
}

export default createSessionService;